import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Alert,
  Linking,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
 import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ============================================================
   Shared helpers (fallback image & auth)
   ============================================================ */
const PLAY_COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

/**
 * @typedef {Object} Gradient
 * @property {string} c1
 * @property {string} c2
 * @property {number} x2
 * @property {number} y2
 */

const hashSeed = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const isApprovedStatus = (s: string): boolean =>
  /approved/i.test(String(s || "").trim());

const gradientFor = (seed: string): { c1: string; c2: string; x2: number; y2: number } => {
  const h = hashSeed(seed || "AI");
  const i1 = h % PLAY_COLORS.length;
  const i2 = (i1 + 1 + ((h >> 3) % (PLAY_COLORS.length - 1))) % PLAY_COLORS.length;
  const c1 = PLAY_COLORS[i1];
  const c2 = PLAY_COLORS[i2];
  const angle = [
    [0, 1],
    [1, 0],
    [0, 0],
    [1, 1],
  ][(h >> 7) & 3];
  return { c1, c2, x2: angle[0], y2: angle[1] };
};

/**
 * @typedef {Object} FallbackImage
 * @property {string} initials
 * @property {string} backgroundColor
 * @property {string} color
 */

const makeInitialsImage = (name: string): { initials: string; backgroundColor: string; color: string } => {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join("") || "AI";

  const { c1, c2 } = gradientFor(name || "AI");
  
  return {
    initials,
    backgroundColor: c1,
    color: c2,
  };
};

const BASE_URL = "https://meta.oxyloans.com/api";

const apiClient = axios.create({
  baseURL: (BASE_URL || "").replace(/\/+$/, ""),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const PRELOGIN_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzOGY3MWRhMy01ZjFkLTRiODItYTgzZi0wZmM0MDU4ZTI1NTQiLCJpYXQiOjE3NTkyMzExMTEsImV4cCI6MTc2MDA5NTExMX0.WPotQxTI9_HuJJ_YXzKJPaWb6GU9F9nf8BUI5HjmZZB3N8Vw0Mad7K0rpRcXViqFqSF5u23IoyKMqkszkKpxmQ";

function getOptionalAuthHeaders() {
  const token = PRELOGIN_TOKEN;

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/* ============================================================
   Types
   ============================================================ */
/**
 * @typedef {Object} Assistant
 * @property {string=} id
 * @property {string=} assistantId
 * @property {string=} agentId
 * @property {string=} name
 * @property {string=} description
 * @property {string=} status
 * @property {string=} imageUrl
 * @property {string=} image
 * @property {string=} thumbUrl
 * @property {string=} ownerId
 * @property {string=} userId
 * @property {string=} createdBy
 * @property {Object|null=} metadata
 * @property {string=} displayName
 */

/**
 * @typedef {Object} OtherAgent
 * @property {string} id
 * @property {string} agentName
 * @property {string} description
 * @property {string} url
 * @property {string=} categoryType
 */

/**
 * @typedef {Assistant & {displayName: string, imageUrl: string}} InsView
 */

/**
 * @typedef {Assistant & {displayName: string}} HcView
 */

/**
 * @typedef {Object} RootStackParamList
 * @property {{assistantId: string, agentId?: string}} Assistant
 */

/**
 * @typedef {NativeStackNavigationProp<RootStackParamList>} NavigationProp
 */

/* ============================================================
   MY AGENTS (Admin)
   ============================================================ */
function normalizeAssistantsPayload(resData: any): any[] {
  const list = Array.isArray(resData?.data)
    ? resData.data
    : Array.isArray(resData)
    ? resData
    : [];
  return list.map((a: any) => ({
    ...a,
    assistantId: a?.assistantId || a?.id,
    agentId: a?.agentId || a?.id || a?.assistantId,
    imageUrl: a?.imageUrl || a?.image || a?.thumbUrl || "",
    description: a?.description ?? a?.desc ?? "",
    status: a?.status || a?.agentStatus,
  }));
}

async function getAssistantsByUserId(userId: string): Promise<any[]> {
  const headers = getOptionalAuthHeaders();

  try {
    const resp = await apiClient.get("/ai-service/agent/getAssistantsByUserId", {
      headers,
      params: { userId },
    });
    const list = normalizeAssistantsPayload(resp?.data);
    if (Array.isArray(list) && list.length) return list;
  } catch {}

  let after: string | undefined;
  let collected: any[] = [];
  for (let page = 0; page < 8; page++) {
    const config: any = { headers };
    if (after) config.params = { after };
    const res = await apiClient.get("/ai-service/agent/getAllAssistants", config);

    const normalized = normalizeAssistantsPayload(res?.data);
    collected = collected.concat(normalized);

    const hasMore = !!(res?.data?.has_more ?? res?.data?.hasMore);
    after = res?.data?.lastId;
    if (!hasMore) break;
  }

  const target = (userId || "").trim().toLowerCase();
  return collected.filter((a) => {
    const o1 = (a.ownerId || "").toString().toLowerCase();
    const o2 = (a.userId || "").toString().toLowerCase();
    const o3 = (a.createdBy || "").toString().toLowerCase();
    return [o1, o2, o3].some((v) => v && v === target);
  });
}

/**
 * @typedef {Object} AdminCardProps
 * @property {Assistant} a
 * @property {() => void} onOpen
 */

const AdminCard = ({ a, onOpen }: { a: any; onOpen: () => void }) => {
  const title = a.name || "Untitled Agent";
  const fallbackImage = makeInitialsImage(title);
  const [imgError, setImgError] = useState(!a.imageUrl);
  const approved = isApprovedStatus(a.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onOpen}>
      <View style={[styles.cardImageContainer, { backgroundColor: fallbackImage.backgroundColor }]}>
        {!imgError && a.imageUrl ? (
          <Image
            source={{ uri: a.imageUrl }}
            style={styles.cardImage}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.fallbackImage}>
            <Text style={[styles.fallbackText, { color: "#FFFFFF" }]}>
              {fallbackImage.initials}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {a.description || ""}
        </Text>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              approved ? styles.approvedBadge : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                approved ? styles.approvedText : styles.pendingText,
              ]}
            >
              {a.status || "Unknown"}
            </Text>
          </View>
          <Text style={styles.openText}>Open →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyAgentsTab = () => {
  const navigation = useNavigation();
  const USER_ID = "9f2cf68b-6f03-417d-a903-be7d80d2d927";

  const isOwnedBy = (a: any, uid: string) => {
    const target = uid.toLowerCase();
    const o1 = (a.ownerId || "").toString().toLowerCase();
    const o2 = (a.userId || "").toString().toLowerCase();
    const o3 = (a.createdBy || "").toString().toLowerCase();
    return [o1, o2, o3].some((v) => v && v === target);
  };

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const approvedAgents = useMemo(
    () => agents.filter((a: any) => isOwnedBy(a, USER_ID) && isApprovedStatus(a.status)),
    [agents]
  );


const handleOpen = (assistant: any) => {
  Alert.alert("Open Agent", `Would open agent: ${assistant.name}`,[
    {
      text: "Cancel", 
      style: "cancel"
    },
    {
      text: "OK",
      onPress: () => {
        router.push({
          pathname: '/userflow/GenOxyChatScreen',
          params: { 
            assistantId: assistant.assistantId,
            query: "", 
            category: "Assistant",
            agentName: assistant.name || "Assistant",
            fd: null,
            agentId: assistant.agentId,
            title: assistant.name || "Chat with Agent",
          }
        });
      }
    }
  ]);
};
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await getAssistantsByUserId(USER_ID);
        setAgents(list);
      } catch (e: any) {
        const status = e?.response?.status;
        const body = e?.response?.data;
        setErr(body?.message || `Failed to load (HTTP ${status || "?"})`);
      } finally {
        setLoading(false);
      }
    })();
  }, [USER_ID]);

  if (err) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{err}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: "100%" }]} />
              <View style={[styles.skeletonLine, { width: "85%" }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (approvedAgents.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🤖</Text>
        <Text style={styles.emptyTitle}>No Approved Agents Found</Text>
        <Text style={styles.emptyDescription}>
          We didn't find approved agents for{" "}
          <Text style={styles.codeText}>9f2cf68b-6f03-417d-a903-be7d80d2d927</Text>.
          Make sure you're logged in as the right user, or check the agent status in the backend.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {approvedAgents.map((a, i) => (
        <AdminCard
          key={`${a.assistantId || a.id || i}`}
          a={a}
          onOpen={() => handleOpen(a)}
        />
      ))}
    </View>
  );
};

/* ============================================================
   INSURANCE (embedded)
   ============================================================ */
const INS_CANONICAL = [
  "AI-Based IRDAI GI Reg Audit",
  "AI-Based IRDAI LI Reg Audit by ASKOXY.AI",
  "IRDAI Enforcement Actions",
  "General Insurance Discovery",
  "Life Insurance Citizen Discovery",
];

const INS_ID_TO_CANONICAL = {
  asst_fGP7NQpP6kbr5iHGtaFhrhow: "AI-Based IRDAI GI Reg Audit",
  asst_hKOb17A6fLeBFKq05sDLVbSL: "AI-Based IRDAI LI Reg Audit by ASKOXY.AI",
  asst_v65QvaurFXMf7VJ8oFJ6F6Zn: "IRDAI Enforcement Actions",
  asst_bRxg1cfAfcQ05O3UGUjcAwwC: "General Insurance Discovery",
  asst_G2jtvsfDcWulax5QDcyWhFX1: "Life Insurance Citizen Discovery",
};

const INS_NAME_TO_IMAGE = {
  "AI-Based IRDAI GI Reg Audit":
    "https://i.ibb.co/PGtHTnf9/Chat-GPT-Image-Sep-21-2025-09-13-25-AM.png",
  "IRDAI Enforcement Actions":
    "https://i.ibb.co/GZ41fZ1/Chat-GPT-Image-Sep-21-2025-09-13-22-AM.png",
  "AI-Based IRDAI LI Reg Audit by ASKOXY.AI":
    "https://i.ibb.co/6JmrvSXc/Chat-GPT-Image-Sep-21-2025-09-11-37-AM.png",
  "General Insurance Discovery":
    "https://i.ibb.co/BHLgWkHx/Chat-GPT-Image-Sep-21-2025-09-09-37-AM.png",
  "Life Insurance Citizen Discovery":
    "https://i.ibb.co/3ybg3TMD/Chat-GPT-Image-Sep-22-2025-12-33-31-PM.png",
};

/**
 * @typedef {Object} GetAllAssistantsResponse
 * @property {Assistant[]} data
 * @property {boolean} has_more
 * @property {string=} lastId
 */

async function getAllAssistants(after?: string): Promise<{ data: any[]; has_more: boolean; lastId?: string }> {
  const config: any = { headers: getOptionalAuthHeaders() };
  if (after) config.params = { after };
  const res = await apiClient.get("/ai-service/agent/getAllAssistants", config);
  const normalized = (res.data?.data ?? []).map((a: any) => ({
    ...a,
    assistantId: a?.assistantId || a?.id,
    agentId: a?.agentId || a?.id || a?.assistantId,
    imageUrl: a?.imageUrl || a?.image || a?.thumbUrl || "",
    description: a?.description ?? a?.desc ?? "",
    status: a?.status || a?.agentStatus,
  }));
  return {
    data: normalized,
    has_more: !!(res.data?.has_more ?? res.data?.hasMore),
    lastId: res.data?.lastId,
  };
}

function insMapImage(displayName: string, apiImage: string): string {
  const cleaned = (apiImage || "").trim();
  return cleaned || (INS_NAME_TO_IMAGE as any)[displayName] || "";
}

function buildInsuranceListById(all: any[]): any[] {
  return all
    .filter((a) => {
      const id = (a.assistantId || a.id || "").trim();
      return id && (INS_ID_TO_CANONICAL as any)[id];
    })
    .map((a) => {
      const id = (a.assistantId || a.id || "").trim();
      const displayName = (INS_ID_TO_CANONICAL as any)[id];
      return {
        ...a,
        displayName,
        imageUrl: insMapImage(displayName, a.imageUrl),
      };
    })
    .sort(
      (a, b) =>
        INS_CANONICAL.indexOf(a.displayName) -
        INS_CANONICAL.indexOf(b.displayName)
    );
}

/**
 * @typedef {Object} ReadMoreModalProps
 * @property {boolean} open
 * @property {() => void} onClose
 * @property {string} title
 * @property {string} body
 */

const ReadMoreModal = ({ open, onClose, title, body }: { open: boolean; onClose: () => void; title: string; body: string }) => {
  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>{body}</Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.modalActionButton}>
              <Text style={styles.modalActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * @typedef {Object} TileCardProps
 * @property {InsView|HcView} a
 * @property {() => void} onOpen
 * @property {string} badge
 */

const TileCard = ({ a, onOpen, badge }: { a: any; onOpen: () => void; badge: string }) => {
  const [showMore, setShowMore] = useState(false);
  const title = a.displayName || a.name || "Untitled Agent";
  const [imgError, setImgError] = useState(false);

  return (
    <View style={styles.tileCard}>
      <TouchableOpacity onPress={onOpen} style={styles.tileCardInner}>
        <View style={styles.tileImageContainer}>
          {!imgError && a.imageUrl ? (
            <Image
              source={{ uri: a.imageUrl }}
              style={styles.tileImage}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.tileFallback}>
              <Text style={styles.tileFallbackIcon}>🤖</Text>
            </View>
          )}
          <View style={styles.tileBadgeContainer}>
            <View style={styles.tileIconBadge}>
              <Text style={styles.tileIcon}>🤖</Text>
            </View>
          </View>
        </View>

        <View style={styles.tileContent}>
          <View style={styles.tileHeader}>
            <View style={styles.tileTitleContainer}>
              <Text style={styles.tileTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.tileDescription} numberOfLines={3}>
                {a.description || ""}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{badge}</Text>
            </View>
          </View>

          <View style={styles.tileActions}>
            <TouchableOpacity onPress={onOpen} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMore(true)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <ReadMoreModal
        open={showMore}
        onClose={() => setShowMore(false)}
        title={title}
        body={a.description || ""}
      />
    </View>
  );
};

const InsuranceTab = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadWhitelisted(initialAfter?: string) {
    let after = initialAfter;
    let collected: any[] = [];
    const target = Object.keys(INS_ID_TO_CANONICAL).length;
    for (let i = 0; i < 5; i++) {
      const res = await getAllAssistants(after);
      collected = collected.concat(res.data);
      const filtered = buildInsuranceListById(collected);
      setItems(filtered);
      if (filtered.length >= target || !res.has_more) return;
      after = res.lastId;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await loadWhitelisted();
      } catch (e: any) {
        const status = (e as any)?.response?.status;
        const body = (e as any)?.response?.data;
        setErr(
          (body as any)?.message || `Failed to load agents${status ? ` (HTTP ${status})` : ""}`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // const handleOpen = (a) => {
  //   Alert.alert("Open Insurance Agent", `Would open: ${a.displayName || a.name}`);
  // };

const handleOpen = (assistant: any) => {
  Alert.alert("Open Insurance Agent", `Would open: ${assistant.displayName || assistant.name}`, [
    {
      text: "Cancel", 
      style: "cancel"
    },
    {
      text: "Okay",
      onPress: () => {
        router.push({
          pathname: '/userflow/GenOxyChatScreen',
          params: { 
            assistantId: assistant.assistantId,
            query: "", 
            category: "Assistant",
            agentName: assistant.name || "Assistant",
            fd: null,
            agentId: assistant.agentId,
            title: assistant.name || "Chat with Agent",
          }
        });
      }
    }
  ]);
};

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={`ins-skeleton-${i}`} style={styles.tileSkeleton}>
            <View style={styles.tileSkeletonImage} />
            <View style={styles.tileSkeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: "100%" }]} />
              <View style={[styles.skeletonLine, { width: "85%" }]} />
              <View style={styles.tileSkeletonActions}>
                <View style={styles.skeletonButton} />
                <View style={styles.skeletonButton} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{err}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🤖</Text>
        <Text style={styles.emptyTitle}>No Insurance Agents Found</Text>
        <Text style={styles.emptyDescription}>
          Check later or contact the admin.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {items.map((a, i) => (
        <TileCard
          key={`${a.displayName}-${a.assistantId || a.id || i}`}
          a={a}
          onOpen={() => handleOpen(a)}
          badge="Insurance"
        />
      ))}
    </View>
  );
};

/* ============================================================
   HEALTHCARE (embedded)
   ============================================================ */
const HC_CANONICAL = ["Dr. KneeWell", "Dr. PainCare"];

const HC_ID_TO_CANONICAL = {
  asst_Os6dN1Jpn8EywCUDQSvSb8xk: "Dr. KneeWell",
  asst_dPKfeLYbA0B0otqx9hsLEUyu: "Dr. PainCare",
};

function buildHealthcareListById(all: any[]): any[] {
  return all
    .filter((a) => {
      const id = (a.assistantId || a.id || "").trim();
      return id && (HC_ID_TO_CANONICAL as any)[id];
    })
    .map((a) => {
      const id = (a.assistantId || a.id || "").trim();
      const displayName = (HC_ID_TO_CANONICAL as any)[id];
      return { ...a, displayName };
    })
    .sort(
      (a, b) =>
        HC_CANONICAL.indexOf(a.displayName) - HC_CANONICAL.indexOf(b.displayName)
    );
}

const HealthcareTab = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadWhitelisted(initialAfter?: string) {
    let after = initialAfter;
    let collected: any[] = [];
    const target = Object.keys(HC_ID_TO_CANONICAL).length;
    for (let i = 0; i < 5; i++) {
      const res = await getAllAssistants(after);
      collected = collected.concat(res.data);
      const filtered = buildHealthcareListById(collected);
      setItems(filtered);
      if (filtered.length >= target || !res.has_more) return;
      after = res.lastId;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await loadWhitelisted();
      } catch (e: any) {
        const status = (e as any)?.response?.status;
        const body = (e as any)?.response?.data;
        setErr(
          (body as any)?.message || `Failed to load agents${status ? ` (HTTP ${status})` : ""}`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleOpen = (a: any) => {
    Alert.alert("Open Healthcare Agent", `Would open: ${a.displayName || a.name}`);
  };

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={`hc-skel-${i}`} style={styles.tileSkeleton}>
            <View style={styles.tileSkeletonImage} />
            <View style={styles.tileSkeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: "100%" }]} />
              <View style={[styles.skeletonLine, { width: "85%" }]} />
              <View style={styles.tileSkeletonActions}>
                <View style={styles.skeletonButton} />
                <View style={styles.skeletonButton} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{err}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🤖</Text>
        <Text style={styles.emptyTitle}>No Agents Found</Text>
        <Text style={styles.emptyDescription}>
          We couldn't find the requested healthcare agents. Try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {items.map((a, i) => (
        <TileCard
          key={`${a.displayName}-${a.assistantId || a.id || i}`}
          a={a}
          onOpen={() => handleOpen(a)}
          badge="Healthcare"
        />
      ))}
    </View>
  );
};

/* ============================================================
   OTHER AGENTS TAB
   ============================================================ */
const OtherAgentsTab = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiClient.get("/ai-service/agent/getAllUrls", {
          headers: getOptionalAuthHeaders(),
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setItems(list);
      } catch (e: any) {
        const status = e?.response?.status;
        const body = e?.response?.data;
        setErr(body?.message || `Failed to load (HTTP ${status || "?"})`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      const c = ((it as any).categoryType || "").trim();
      if (c) set.add(c);
    }
    return ["ALL", ...Array.from(set).sort((a: any, b: any) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(
    () =>
      category === "ALL"
        ? items
        : items.filter(
            (it) =>
              ((it as any).categoryType || "").toLowerCase() === category.toLowerCase()
          ),
    [items, category]
  );

  const openWithDisclaimer = (url: string) => setSelectedUrl(url);
  
  const confirmNavigation = async () => {
    if (selectedUrl) {
      const supported = await Linking.canOpenURL(selectedUrl);
      if (supported) {
        await Linking.openURL(selectedUrl);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
      setSelectedUrl(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`other-skeleton-${i}`} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: "100%" }]} />
              <View style={[styles.skeletonLine, { width: "85%" }]} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{err}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🤖</Text>
        <Text style={styles.emptyTitle}>No GPT Store Agents Found</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Category:</Text>
        <View style={styles.filterSelect}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c: any) => (
              <TouchableOpacity
                key={String(c)}
                onPress={() => setCategory(String(c))}
                style={[
                  styles.filterOption,
                  category === c && styles.filterOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    category === c && styles.filterOptionTextActive,
                  ]}
                >
                  {String(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.grid}>
        {filtered.map((a: any) => {
          const title = a.agentName || "AI Agent";
          const fallbackImage = makeInitialsImage(title);

          return (
            <TouchableOpacity
              key={a.id}
              onPress={() => openWithDisclaimer(a.url)}
              style={styles.card}
            >
              <View
                style={[
                  styles.cardImageContainer,
                  { backgroundColor: fallbackImage.backgroundColor },
                ]}
              >
                <View style={styles.fallbackImage}>
                  <Text style={[styles.fallbackText, { color: "#FFFFFF" }]}>
                    {fallbackImage.initials}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  {a.categoryType && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {a.categoryType}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardDescription} numberOfLines={3}>
                  {a.description || ""}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.openText}>Open →</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={!!selectedUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUrl(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.disclaimerModal}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              You are leaving ASKOXY.AI and moving to a GPT Store–related platform.
            </Text>
            <View style={styles.disclaimerActions}>
              <TouchableOpacity
                onPress={() => setSelectedUrl(null)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmNavigation}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const RadhaAILab = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [showTabsInfo, setShowTabsInfo] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.main}>
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
 <Text style={styles.headerTitle}>
                Greetings from Radhakrishna!
              </Text>
               <View style={styles.headerImage}>
              <Image
                source={{ uri: "https://i.ibb.co/TBMnfC2K/radha-Prompt.png" }}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </View>

              </View>
             

              <Text style={styles.headerParagraph}>
                I'm genuinely excited about the AI Agents roadmap we're building
                at Bharat AI Store. My personal mission is simple — to make every
                task in our company executable by an AI Agent.
              </Text>
              <Text style={styles.headerParagraph}>
                As part of this journey, I'm experimenting daily with dozens of
                AI Agents — some smart, some still learning, all evolving. Each
                one represents a step toward a more autonomous, scalable future.
              </Text>
              <Text style={styles.headerParagraph}>
                Below, you'll find a growing collection of my live experiments.
                These agents may be basic today, but together, they represent
                the foundation of the AI-driven enterprise of tomorrow.
              </Text>
              <Text style={styles.headerSignature}>
                CEO & Founder{"\n"}
                ASKOXY.AI AI-Z Marketplace{"\n"}
                OxyLoans — RBI Approved P2P NBFC
              </Text>
            </View>

           
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("my")}
            style={[
              styles.tabButton,
              activeTab === "my" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "my" && styles.tabButtonTextActive,
              ]}
            >
              Radha Agents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("insurance")}
            style={[
              styles.tabButton,
              activeTab === "insurance" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "insurance" && styles.tabButtonTextActive,
              ]}
            >
              Insurance Agents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("healthcare")}
            style={[
              styles.tabButton,
              activeTab === "healthcare" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "healthcare" && styles.tabButtonTextActive,
              ]}
            >
              Healthcare Agents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("other")}
            style={[
              styles.tabButton,
              activeTab === "other" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "other" && styles.tabButtonTextActive,
              ]}
            >
              GPT Store Agents
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.tabContent}>
          {activeTab === "my" && <MyAgentsTab />}
          {activeTab === "insurance" && <InsuranceTab />}
          {activeTab === "healthcare" && <HealthcareTab />}
          {activeTab === "other" && <OtherAgentsTab />}
        </View>

        <Modal
          visible={showTabsInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTabsInfo(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tabs Information</Text>
                <TouchableOpacity
                  onPress={() => setShowTabsInfo(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalText}>
                  • <Text style={styles.bold}>Radha Agents</Text>: My personal
                  AI Agents (approved status only).{"\n\n"}
                  • <Text style={styles.bold}>Insurance Agents</Text>: Curated
                  list of insurance-related AI agents.{"\n\n"}
                  • <Text style={styles.bold}>Healthcare Agents</Text>: Curated
                  list of healthcare-related AI agents.{"\n\n"}
                  • <Text style={styles.bold}>GPT Store Agents</Text>: External
                  AI agents from various sources.
                </Text>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setShowTabsInfo(false)}
                  style={styles.modalActionButton}
                >
                  <Text style={styles.modalActionText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default RadhaAILab;

/* ============================================================
   STYLES
   ============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerContent: {
    flexDirection: SCREEN_WIDTH > 768 ? "row" : "column",
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    marginRight: SCREEN_WIDTH > 768 ? 20 : 0,
    marginBottom: SCREEN_WIDTH > 768 ? 0 : 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    width:SCREEN_WIDTH*0.65
  },
  headerParagraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginBottom: 12,
  },
  headerSignature: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
    marginTop: 8,
  },
  headerImage: {
    width: SCREEN_WIDTH > 768 ? 120 : 100,
    height: SCREEN_WIDTH > 768 ? 120 : 100,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1976d2",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#ffffff",
  },
  tabContent: {
    flex: 1,
    minHeight: 400,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginBottom:150
  },
  card: {
    width: SCREEN_WIDTH > 768 ? (SCREEN_WIDTH - 64) / 3 : (SCREEN_WIDTH - 48) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  cardImageContainer: {
    height: 120,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
    // fontWeight:"bold"
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: "#d4edda",
  },
  pendingBadge: {
    backgroundColor: "#fff3cd",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  approvedText: {
    color: "#155724",
  },
  pendingText: {
    color: "#856404",
  },
  openText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
  },
  tileCard: {
    width: SCREEN_WIDTH > 768 ? (SCREEN_WIDTH - 64) / 2 : SCREEN_WIDTH - 32,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  tileCardInner: {
    flex: 1,
  },
  tileImageContainer: {
    height: 140,
    position: "relative",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
  },
  tileFallbackIcon: {
    fontSize: 48,
  },
  tileBadgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  tileIconBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  tileIcon: {
    fontSize: 18,
  },
  tileContent: {
    padding: 16,
    flex: 1,
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tileTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  tileDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976d2",
  },
  tileActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: "auto",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#f1f3f4",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 12,
  },
  filterSelect: {
    flex: 1,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 20,
  },
  filterOptionActive: {
    backgroundColor: "#1976d2",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterOptionTextActive: {
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: "#666",
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  modalActionButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalActionText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  disclaimerModal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  disclaimerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#666",
    marginBottom: 24,
  },
  disclaimerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  skeletonCard: {
    width: SCREEN_WIDTH > 768 ? (SCREEN_WIDTH - 64) / 3 : (SCREEN_WIDTH - 48) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  skeletonImage: {
    height: 120,
    backgroundColor: "#e9ecef",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    marginBottom: 8,
    width: "70%",
  },
  skeletonButton: {
    height: 36,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    marginTop: 8,
  },
  tileSkeleton: {
    width: SCREEN_WIDTH > 768 ? (SCREEN_WIDTH - 64) / 2 : SCREEN_WIDTH - 32,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  tileSkeletonImage: {
    height: 140,
    backgroundColor: "#e9ecef",
  },
  tileSkeletonContent: {
    padding: 16,
  },
  tileSkeletonActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  codeText: {
    fontFamily: "monospace",
    backgroundColor: "#f1f3f4",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
  },
});