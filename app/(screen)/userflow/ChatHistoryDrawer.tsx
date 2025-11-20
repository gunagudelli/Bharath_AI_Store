// ChatHistoryDrawer.tsx
import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Share,
  Modal,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  PanResponder,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

export type ParsedMessage = { role: string; content: string };
export type HistoryItem = { prompt: any; userId?: string; agentId?: string; createdAt?: string; threadId?: string | null };

type Props = {
  visible: boolean;
  onClose: () => void;
  apiUrl?: string;
  token?: string | null;
  title?: string;
  onContinueChat?: (messages: ParsedMessage[], meta?: { rawPrompt?: any; item?: HistoryItem }) => void;
  onStartNewThread?: (messages: ParsedMessage[], meta?: { rawPrompt?: any; item?: HistoryItem }) => void;
  onAutoSend?: (lastUserMessage: string) => void;
  widthPercent?: number;
  debug?: boolean;
};

const DEFAULT_API =
  "https://meta.oxyloans.com/api/ai-service/agent/getUserHistory/14996e93-46c9-46cb-a5fb-8050b8af17ab/224ab9a6-a3a4-475a-a6c0-80d5b98752dc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ---------- Parsing & Normalization Helpers ---------- */
function tryJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
function normalizeUnquotedKeys(s: string) {
  return s.replace(/([{,]\s*)([a-zA-Z0-9_@$-]+)\s*:/g, '$1"$2":');
}
function parseLooseRoleContent(s: string): ParsedMessage[] | null {
  try {
    const blocks = s.match(/\{[^}]+\}/g) || [s];
    const out: ParsedMessage[] = [];
    for (const blk of blocks) {
      const roleMatch = blk.match(/role\s*(?:=|:)\s*(?:"([^"]+)"|'([^']+)'|([^,\n}]+))/i);
      const contentMatch = blk.match(/content\s*(?:=|:)\s*(?:"([\s\S]*?)"|'([\s\S]*?)'|([^,}]+))/i);
      const role = roleMatch ? (roleMatch[1] || roleMatch[2] || roleMatch[3] || "").trim() : undefined;
      const content = contentMatch ? (contentMatch[1] || contentMatch[2] || contentMatch[3] || "").trim() : undefined;
      if (role || content) out.push({ role: role?.toString() ?? "", content: content?.toString() ?? "" });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function parsePrompt(promptRaw: any): ParsedMessage[] {
  if (promptRaw === null || promptRaw === undefined) return [];

  // Already array -> normalize
  if (Array.isArray(promptRaw)) {
    return promptRaw.map((m: any, i: number) => {
      const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
      const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
      return { role, content: String(m?.content ?? m?.text ?? "") };
    });
  }

  const rawStr = String(promptRaw).trim();

  // direct JSON parse
  let parsed: any = tryJsonParse(rawStr);
  if (Array.isArray(parsed)) {
    return parsed.map((m: any, i: number) => {
      const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
      const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
      return { role, content: String(m?.content ?? m?.text ?? "") };
    });
  }

  // unwrap quoted JSON
  if (/^".+"$/.test(rawStr) || /^'.+'$/.test(rawStr)) {
    const unwrapped = rawStr.replace(/^"(.*)"$/s, "$1").replace(/^'(.*)'$/s, "$1");
    parsed = tryJsonParse(unwrapped);
    if (Array.isArray(parsed)) {
      return parsed.map((m: any, i: number) => {
        const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
        const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
        return { role, content: String(m?.content ?? m?.text ?? "") };
      });
    }
  }

  // single quotes -> double quotes
  const singleToDouble = rawStr.replace(/'/g, '"');
  parsed = tryJsonParse(singleToDouble);
  if (Array.isArray(parsed)) {
    return parsed.map((m: any, i: number) => {
      const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
      const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
      return { role, content: String(m?.content ?? m?.text ?? "") };
    });
  }

  // add quotes to keys
  const keyed = normalizeUnquotedKeys(rawStr);
  parsed = tryJsonParse(keyed);
  if (Array.isArray(parsed)) {
    return parsed.map((m: any, i: number) => {
      const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
      const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
      return { role, content: String(m?.content ?? m?.text ?? "") };
    });
  }

  // loose extraction
  const loose = parseLooseRoleContent(rawStr);
  if (loose && loose.length) {
    return loose.map((m: any, i: number) => {
      const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
      const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
      return { role, content: String(m?.content ?? "") };
    });
  }

  // array substring
  const arrayInside = rawStr.match(/\[.*\]/s);
  if (arrayInside) {
    parsed = tryJsonParse(arrayInside[0]);
    if (Array.isArray(parsed)) {
      return parsed.map((m: any, i: number) => {
        const rawRole = (m?.role ?? "").toString().trim().toLowerCase();
        const role = rawRole || (i % 2 === 0 ? "user" : "assistant");
        return { role, content: String(m?.content ?? m?.text ?? "") };
      });
    }
  }

  // final fallback: single user message
  return [{ role: "user", content: rawStr }];
}

const convertPromptString = (promptString : any) => {
  try {
    // Step 1: Replace role=user → "user", role=assistant → "assistant"
    let fixed = promptString
      .replace(/role=/g, '"role":"')
      .replace(/, content=/g, '", "content":"')
      .replace(/},/g, '"},')
      .replace(/}]/g, '"}]')
      .replace(/\[{/g, '[{"');

    // Step 2: Add missing quotes around values
    fixed = fixed.replace(/content=([^},]+)/g, '"content":"$1"');

    // Step 3: Convert string → array
    return JSON.parse(fixed);
  } catch (e) {
    console.log("PARSE ERROR:", e);
    return [];
  }
};


function getFirstUser(parsed: ParsedMessage[]) {
  if (!parsed || parsed.length === 0) return null;
  return parsed.find((m) => m.role?.toLowerCase() === "user") ?? null;
}
function getLastUser(parsed: ParsedMessage[]) {
  if (!parsed || parsed.length === 0) return null;
  return [...parsed].reverse().find((m) => m.role?.toLowerCase() === "user") ?? null;
}

/* ---------- Component ---------- */
const ChatHistoryDrawer: React.FC<Props> = ({
  visible,
  onClose,
  apiUrl = DEFAULT_API,
  token = null,
  title = "Chat History",
  onContinueChat,
  onStartNewThread,
  onAutoSend,
  widthPercent = 0.92,
  debug = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawResp, setRawResp] = useState<any>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailThread, setDetailThread] = useState<ParsedMessage[]>([]);
  const [detailRaw, setDetailRaw] = useState<any>(null);

  const drawerWidth = Math.round(SCREEN_WIDTH * widthPercent);
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const panX = useRef(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRawResp(null);
    try {
      const res = await axios.get(apiUrl, {
        headers: { Accept: "application/json", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        timeout: 20000,
      });
      setRawResp(res.data);
      if (Array.isArray(res.data)) setItems(res.data);
      else if (res.data && Array.isArray(res.data.data)) setItems(res.data.data);
      else if (res.data) setItems([res.data]);
      else setItems([]);
    } catch (err: any) {
      console.warn("fetchHistory error:", err);
      if (err.response) {
        setRawResp(err.response.data);
        setError(`HTTP ${err.response.status}: ${err.response.data?.message ?? JSON.stringify(err.response.data)}`);
      } else setError(err.message ?? "Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    if (visible) {
      fetchHistory();
      Animated.timing(translateX, { toValue: SCREEN_WIDTH - drawerWidth, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      translateX.setValue(SCREEN_WIDTH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy) && gs.dx > 6,
      onPanResponderGrant: () => (panX.current = 0),
      onPanResponderMove: (_, gs) => {
        const dx = gs.dx;
        const minX = SCREEN_WIDTH - drawerWidth;
        const newX = Math.min(SCREEN_WIDTH, Math.max(minX, (SCREEN_WIDTH - drawerWidth) + dx));
        translateX.setValue(newX);
        panX.current = dx;
      },
      onPanResponderRelease: (_, gs) => {
        const threshold = drawerWidth * 0.35;
        if (gs.dx > threshold || gs.vx > 1.2) {
          Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onClose?.());
        } else {
          Animated.timing(translateX, { toValue: SCREEN_WIDTH - drawerWidth, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.timing(translateX, { toValue: SCREEN_WIDTH - drawerWidth, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(),
    })
  ).current;

  const maybeAutoSend = (parsed: ParsedMessage[]) => {
    if (!onAutoSend) return;
    const last = getLastUser(parsed);
    if (last && last.content) {
      try {
        onAutoSend(last.content);
      } catch (e) {
        console.warn("onAutoSend threw", e);
      }
    }
  };

  const openDetail = (item: HistoryItem) => {
    
    const parsed = parsePrompt(item.prompt);

    setDetailThread(parsed); 

    setDetailThread(parsed);
    setDetailRaw(item.prompt);
    setDetailVisible(true);
  };

  const confirmRestoreFromDetail = (asNewThread = false) => {
    if (asNewThread) { 
      onStartNewThread?.(detailThread, { rawPrompt: detailRaw });
    } else {
      onContinueChat?.(detailThread,  detailRaw);
    }
    maybeAutoSend(detailThread);
    setDetailVisible(false);
    Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onClose?.());
  };

  const handleLongPress = (item: HistoryItem) => {
    const parsed = parsePrompt(item.prompt);
    const raw = item.prompt ?? "";
    const actions = [
      { text: "Open (show full thread)", onPress: () => openDetail(item) },
      { text: "Continue (restore full thread)", onPress: () => { onContinueChat?.(parsed, { rawPrompt: raw, item }); maybeAutoSend(parsed); Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 160, useNativeDriver: true }).start(() => onClose?.()); } },
      { text: "Copy raw prompt", onPress: async () => { await Clipboard.setStringAsync(String(raw)); Alert.alert("Copied", "Raw prompt copied"); } },
      { text: "Share", onPress: async () => { try { await Share.share({ message: String(raw) }); } catch { Alert.alert("Error", "Share failed"); } } },
      { text: "Cancel", style: "cancel" as const },
    ];
    Alert.alert("Choose action", undefined, actions, { cancelable: true });
  };

  const renderPreviewFor = (item: HistoryItem): { text: string; parsed: ParsedMessage[] } => {
    const parsed = parsePrompt(item.prompt);
    const firstUser = getFirstUser(parsed);
    if (firstUser && firstUser.content && String(firstUser.content).trim() !== "") return { text: String(firstUser.content), parsed };
    const last = parsed.length ? parsed[parsed.length - 1] : null;
    if (last && last.content && String(last.content).trim() !== "") return { text: String(last.content), parsed };
    return { text: String(item.prompt ?? ""), parsed };
  };

  const renderHistoryItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const { text: previewText, parsed } = renderPreviewFor(item);
    if (!previewText || String(previewText).trim() === "") return null;

    return (
      <TouchableOpacity activeOpacity={0.92} onPress={() => openDetail(item)} onLongPress={() => handleLongPress(item)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{createdAt ? createdAt.toLocaleString() : "Unknown time"}</Text>
            {item.threadId ? <Text style={styles.threadSmall}>Thread: {item.threadId}</Text> : null}
          </View>

          <View style={styles.cardBtns}>
            <TouchableOpacity onPress={() => { const parsed = parsePrompt(item.prompt); onStartNewThread?.(parsed, { rawPrompt: item.prompt, item }); maybeAutoSend(parsed); Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 160, useNativeDriver: true }).start(() => onClose?.()); }} style={styles.iconBtn}>
              <Ionicons name="add-circle-outline" size={20} color="#0f172a" />
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(String(item.prompt ?? "")); Alert.alert("Copied", "Raw prompt copied"); }} style={styles.iconBtn}>
              <Ionicons name="copy-outline" size={18} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => { try { await Share.share({ message: String(item.prompt ?? "") }); } catch { Alert.alert("Error", "Share failed"); } }} style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.previewRow}>
          <Text style={styles.previewText} numberOfLines={1} ellipsizeMode="tail">{previewText}</Text>
        </View>

        {debug && (
          <TouchableOpacity onPress={() => { Alert.alert("Parsed preview", JSON.stringify(parsed.map(p => ({ r: p.role, c: p.content })), null, 2).slice(0, 2000)); }} style={{ marginTop: 8 }}>
            <Text style={{ color: "#2563eb", fontSize: 12 }}>Show parse quick view</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const onBackdropPress = () => {
    Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 180, useNativeDriver: true }).start(() => onClose?.());
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="none" onRequestClose={() => onClose()}>
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={onBackdropPress}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <Animated.View {...panResponder.panHandlers} style={[styles.drawer, { width: drawerWidth, transform: [{ translateX }] }]}>
            <SafeAreaView style={styles.safe}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.headerRight}>
                  <TouchableOpacity onPress={fetchHistory} style={styles.headerBtn}><Ionicons name="refresh-outline" size={22} color="#111827" /></TouchableOpacity>
                  <TouchableOpacity onPress={onBackdropPress} style={styles.headerBtn}><Ionicons name="close" size={22} color="#111827" /></TouchableOpacity>
                </View>
              </View>

              <View style={styles.container}>
                {loading ? (
                  <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.loadingText}>Loading history...</Text></View>
                ) : error ? (
                  <View style={styles.center}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={fetchHistory} style={styles.retryBtn}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View>
                ) : items.length === 0 ? (
                  <View style={styles.center}><Text style={styles.emptyText}>No history found.</Text></View>
                ) : (
                  <FlatList data={items} keyExtractor={(_, i) => String(i)} renderItem={renderHistoryItem} contentContainerStyle={styles.listContent} />
                )}

                {debug && (
                  <View style={styles.debugBox}>
                    <Text style={styles.debugTitle}>Raw response (preview)</Text>
                    <ScrollView style={{ maxHeight: 180 }}>
                      <Text style={styles.debugText}>{rawResp ? JSON.stringify(rawResp, null, 2).slice(0, 2000) : "–"}</Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      {/* Detail modal inside drawer */}
      <Modal visible={detailVisible} transparent animationType="fade" onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Full conversation</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(JSON.stringify(detailThread, null, 2)); Alert.alert("Copied", "Full thread copied"); }} style={{ marginRight: 8 }}><Ionicons name="copy-outline" size={20} /></TouchableOpacity>
                <TouchableOpacity onPress={async () => { try { await Share.share({ message: JSON.stringify({ thread: detailThread, raw: detailRaw }, null, 2) }); } catch { Alert.alert("Error", "Share failed"); } }} style={{ marginRight: 8 }}><Ionicons name="share-social-outline" size={20} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setDetailVisible(false)}><Ionicons name="close" size={22} /></TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.detailBody}>
              {detailThread.length === 0 ? (
                <Text style={styles.emptyText}>No messages</Text>
              ) : (
                detailThread.map((m, i) => (
                  <View key={i} style={[styles.msgRow, m.role === "user" ? styles.msgUser : styles.msgAssistant]}>
                    <Text style={styles.msgRole}>{m.role === "user" ? "You" : m.role}</Text>
                    <Text style={styles.msgContent}>{m.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.detailFooter}>
              <TouchableOpacity style={styles.detailBtn} onPress={() => confirmRestoreFromDetail(false)}>
                <Text style={styles.detailBtnText}>Continue (restore)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.detailBtn, { backgroundColor: "#e5e7eb" }]} onPress={() => confirmRestoreFromDetail(true)}>
                <Text style={[styles.detailBtnText, { color: "#111827" }]}>Start new thread</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.5)" },
  drawer: { backgroundColor: "#f8fafc", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, elevation: 20, borderLeftWidth: 1, borderLeftColor: "#e6e9ef" },
  safe: { flex: 1 },
  header: { height: 56, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#e6e9ef", borderBottomWidth: 1, backgroundColor: "#fff" },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: "#374151" },
  errorText: { color: "#b91c1c", textAlign: "center", marginBottom: 12 },
  retryBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: "#fff" },
  listContent: { paddingBottom: 28 },

  card: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e6e9ef", overflow: "hidden", width: "92%" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 13, color: "#374151", fontWeight: "700" },
  threadSmall: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  cardBtns: { flexDirection: "row", alignItems: "center" },
  iconBtn: { marginLeft: 8, padding: 6 },

  previewRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  previewText: { flex: 1, fontSize: 14, color: "#111827", lineHeight: 20 },

  debugBox: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: "#fff7ed", borderColor: "#fbd38d", borderWidth: 1 },
  debugTitle: { fontWeight: "700", marginBottom: 6 },
  debugText: { fontSize: 12, color: "#92400e" },

  // detail modal
  detailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  detailCard: { width: "92%", maxHeight: "86%", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  detailHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#e6e9ef", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: { fontSize: 16, fontWeight: "700" },
  detailBody: { padding: 12 },
  detailFooter: { padding: 12, flexDirection: "row", justifyContent: "space-between" } as any,
  detailBtn: { flex: 1, padding: 12, backgroundColor: "#111827", borderRadius: 8, alignItems: "center", marginRight: 8 },
  detailBtnText: { color: "#fff", fontWeight: "700" },

  msgRow: { marginBottom: 12, padding: 10, borderRadius: 8 },
  msgUser: { backgroundColor: "#eef2ff" },
  msgAssistant: { backgroundColor: "#f3f4f6" },
  msgRole: { fontSize: 12, fontWeight: "700", color: "#111827", marginBottom: 6 },
  msgContent: { fontSize: 14, color: "#111827", lineHeight: 20 },

  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center" },
});

export default ChatHistoryDrawer;
