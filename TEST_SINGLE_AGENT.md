# Single-Agent Mode Test Checklist

## ✅ Configuration Files Status

### 1. app.config.js
- ✅ Reads `EXPO_PUBLIC_AGENT_ID` from environment
- ✅ Reads `EXPO_PUBLIC_AGENT_NAME` from environment
- ✅ Stores both in `extra.agentId` and `extra.agentName`
- ✅ Changes app name to agent name
- ✅ Changes slug to include agent ID

### 2. eas.json
- ✅ Has `agent-apk` profile
- ✅ Has `env` section declaring `EXPO_PUBLIC_AGENT_ID` and `EXPO_PUBLIC_AGENT_NAME`
- ✅ Uses `distribution: "internal"` for runtime env injection

### 3. GitHub Actions Workflow
- ✅ Receives agent data in `client_payload`
- ✅ Sets `EXPO_PUBLIC_AGENT_ID` environment variable
- ✅ Sets `EXPO_PUBLIC_AGENT_NAME` environment variable
- ✅ Runs `eas build --profile agent-apk`

## ✅ Runtime Detection Files

### 4. utils/singleAgentMode.ts
- ✅ `isSingleAgentMode()` reads from `Constants.expoConfig.extra.agentId`
- ✅ Validates agent ID is string and not empty
- ✅ `getSingleAgentConfig()` returns agent data
- ✅ `filterAgentsForMode()` filters agent list to single agent

### 5. app/(screen)/_layout.tsx
- ✅ Checks `Constants.expoConfig.extra.agentId` at runtime
- ✅ Renders `SingleAgentTemplate` when agent ID exists
- ✅ Blocks normal multi-agent navigation

### 6. app/(auth)/_layout.tsx
- ✅ Checks for single-agent mode after login
- ✅ Renders `SingleAgentTemplate` instead of redirecting to tabs

### 7. app/(screen)/(tabs)/index.tsx
- ✅ Has useEffect that checks for single-agent mode
- ✅ Redirects to chat if agent data found
- ⚠️ POTENTIAL ISSUE: This might conflict with _layout.tsx

### 8. templates/SingleAgentTemplate.tsx
- ✅ Reads agent data from `Constants.expoConfig.extra`
- ✅ Shows single agent UI
- ✅ Has direct chat button

## 🔥 Expected Flow

### Multi-Agent APK (Normal):
1. User logs in
2. `app/(auth)/_layout.tsx` checks: No agent data → Redirect to tabs
3. `app/(screen)/_layout.tsx` checks: No agent data → Show normal Stack
4. User sees agent list

### Single-Agent APK (Automated):
1. User logs in
2. `app/(auth)/_layout.tsx` checks: Agent data exists → Render `SingleAgentTemplate`
3. User sees ONLY that agent
4. No agent list, no navigation to other agents

## ⚠️ Potential Issue Found

**CONFLICT**: Both `app/(screen)/_layout.tsx` and `app/(screen)/(tabs)/index.tsx` check for single-agent mode.

**Problem**: If `_layout.tsx` renders `SingleAgentTemplate`, then `(tabs)/index.tsx` never runs. But if somehow tabs loads, it will try to redirect again.

**Solution**: The current setup is correct. `_layout.tsx` should catch single-agent mode BEFORE tabs load.

## 🧪 How to Test

1. **Commit Changes**:
   ```bash
   git add app.config.js eas.json
   git commit -m "Fix: Add agent data to extra and env for single-agent APK"
   git push
   ```

2. **Trigger APK Build**:
   - Open app in dev mode
   - Click "📥 APK" button on any agent
   - Wait for build to complete (~5-10 minutes)

3. **Download and Install APK**:
   - Download APK from link
   - Install on Android device
   - Open app

4. **Expected Behavior**:
   - Login screen appears
   - After login, should see `SingleAgentTemplate` with ONLY that agent
   - No agent list
   - No tabs
   - Direct "Start Conversation" button

5. **Verify in Logs**:
   ```
   🔧 Build Config: { agentId: 'asst_xxx', agentName: 'Agent Name', slug: 'bharath-ai-asst_xxx' }
   🔍 Single Agent Detection: { isSingleAgent: true, finalAgentId: 'asst_xxx' }
   ✅ Rendering SingleAgentTemplate for single-agent APK
   ```

## 🐛 If It Still Shows All Agents

Check these in order:

1. **GitHub Actions Logs**: Verify env vars were set
   ```
   EXPO_PUBLIC_AGENT_ID: asst_xxx
   EXPO_PUBLIC_AGENT_NAME: Agent Name
   ```

2. **EAS Build Logs**: Verify env vars were passed to build
   ```
   Using environment variables from eas.json
   ```

3. **APK Runtime Logs**: Connect device and check logs
   ```bash
   adb logcat | grep "Single Agent"
   ```

4. **Constants Check**: Add debug in `SingleAgentTemplate.tsx`
   ```typescript
   console.log('DEBUG:', JSON.stringify(Constants.expoConfig?.extra, null, 2));
   ```

## ✅ Current Status

All files are correctly configured. The next step is to:
1. Commit and push changes
2. Trigger a new APK build
3. Test the downloaded APK

The previous APK showed all agents because `eas.json` was missing the `env` section.
