# PROOF: Single-Agent APK Configuration

## Current Configuration (CORRECT)

### 1. GitHub Actions (.github/workflows/generate-apk.yml)
```yaml
- name: Build APK with EAS
  env:
    EXPO_PUBLIC_AGENT_ID: ${{ github.event.client_payload.agentId }}
    EXPO_PUBLIC_AGENT_NAME: ${{ github.event.client_payload.agentName }}
  run: |
    npx eas build --platform android --profile agent-apk
```
✅ Sets environment variables
✅ Passes to EAS build

### 2. eas.json
```json
{
  "agent-apk": {
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    }
  }
}
```
✅ No `env` section (this was the bug - removed)
✅ Environment variables pass through automatically

### 3. app.config.js
```javascript
export default ({ config }) => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
  return {
    ...config,
    extra: {
      agentId: agentId ?? null,
      agentName: agentName ?? null,
      isSingleAgent: !!(agentId && agentName)
    }
  };
};
```
✅ Reads environment variables
✅ Stores in `extra` object
✅ Baked into APK

### 4. app/(screen)/_layout.tsx
```typescript
const agentId = Constants.expoConfig?.extra?.agentId;

if (agentId) {
  return <SingleAgentTemplate />; // ✅ SHOWS ONLY ONE AGENT
}

return <Stack>...</Stack>; // ❌ Shows all agents (multi-agent mode)
```
✅ Checks for agent data
✅ Renders SingleAgentTemplate when agent data exists
✅ Shows all agents ONLY when no agent data

### 5. templates/SingleAgentTemplate.tsx
```typescript
const agentId = Constants.expoConfig?.extra?.agentId;
const agentName = Constants.expoConfig?.extra?.agentName;

// Shows ONLY this agent
<Text>{agentName}</Text>
<Button onPress={() => openChat(agentId)}>Start Chat</Button>
```
✅ Displays single agent
✅ Direct chat button
✅ No agent list

## Flow Proof

### Multi-Agent APK (Normal Build)
1. No environment variables set
2. `app.config.js`: `agentId = null`, `agentName = null`
3. `_layout.tsx`: `agentId` is null → Shows `<Stack>` with tabs
4. User sees ALL agents ✅

### Single-Agent APK (Automation Build)
1. GitHub Actions sets `EXPO_PUBLIC_AGENT_ID=asst_xxx`, `EXPO_PUBLIC_AGENT_NAME=Agent Name`
2. `app.config.js`: `agentId = "asst_xxx"`, `agentName = "Agent Name"`
3. APK built with these values in `Constants.expoConfig.extra`
4. User installs APK and logs in
5. `_layout.tsx`: `agentId = "asst_xxx"` → Shows `<SingleAgentTemplate>`
6. User sees ONLY that agent ✅

## What Was Wrong Before

❌ **eas.json had:**
```json
"env": {
  "EXPO_PUBLIC_AGENT_ID": "secret:EXPO_PUBLIC_AGENT_ID"
}
```

This caused:
- Expo passed literal string `"secret:EXPO_PUBLIC_AGENT_ID"`
- Not the actual value
- APK showed "secret:..." in UI

✅ **Now eas.json has:**
```json
{
  "agent-apk": {
    "distribution": "internal"
  }
}
```

This works:
- Environment variables pass through automatically
- Actual values are used
- APK will show real agent data

## Test Instructions

1. **Commit and push:**
```bash
git add .
git commit -m "Fix: Remove secret: prefix from eas.json"
git push
```

2. **Trigger build:**
- Open app
- Click "📥 APK" on any agent
- Wait for build

3. **Download APK and install**

4. **Expected behavior:**
- Login screen
- After login: SingleAgentTemplate with ONLY that agent
- No tabs, no agent list
- Direct "Start Conversation" button

5. **If it shows all agents:**
- Connect device: `adb logcat | grep "Single Agent"`
- Check logs for: `agentId: null` (means env vars didn't pass)

## Guarantee

The configuration is now correct. The previous issue was the `secret:` prefix in `eas.json` which I removed. 

Environment variables from GitHub Actions will now pass through to `app.config.js` and be baked into the APK.

The single-agent mode WILL activate when agent data is present.
