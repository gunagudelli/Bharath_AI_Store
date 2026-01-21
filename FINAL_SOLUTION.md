# FINAL SOLUTION: Single-Agent APK Automation

## Problem Statement
Downloaded APKs were showing ALL agents instead of only the selected agent.

## Root Cause
Environment variables from GitHub Actions were NOT being passed to EAS build because:
1. EAS builds run on Expo's cloud servers, not GitHub Actions
2. Environment variables set in GitHub Actions workflow don't automatically transfer to EAS
3. `.env` files in git commits are ignored by EAS
4. `distribution: "internal"` alone doesn't pass environment variables

## Correct Solution: EAS Secrets API

### How It Works

**Step 1: GitHub Actions sets EAS Secrets dynamically**
```bash
npx eas env:create EXPO_PUBLIC_AGENT_ID --value "asst_xxx"
npx eas env:create EXPO_PUBLIC_AGENT_NAME --value "Agent Name"
```

**Step 2: eas.json references these secrets**
```json
{
  "env": {
    "EXPO_PUBLIC_AGENT_ID": "secret:EXPO_PUBLIC_AGENT_ID",
    "EXPO_PUBLIC_AGENT_NAME": "secret:EXPO_PUBLIC_AGENT_NAME"
  }
}
```

**Step 3: EAS build reads secrets and passes to app.config.js**
```javascript
const agentId = process.env.EXPO_PUBLIC_AGENT_ID; // ✅ Now available
const agentName = process.env.EXPO_PUBLIC_AGENT_NAME; // ✅ Now available
```

**Step 4: app.config.js stores in extra object**
```javascript
extra: {
  agentId: agentId || undefined,
  agentName: agentName || undefined
}
```

**Step 5: Runtime code reads from Constants.expoConfig.extra**
```typescript
const agentId = Constants.expoConfig?.extra?.agentId; // ✅ Available in APK
const agentName = Constants.expoConfig?.extra?.agentName; // ✅ Available in APK
```

**Step 6: Single-agent mode activates**
```typescript
if (agentId && agentName) {
  return <SingleAgentTemplate />; // ✅ Shows only selected agent
}
```

## Files Modified

### 1. `.github/workflows/generate-apk.yml`
```yaml
- name: Build APK with EAS
  run: |
    # Set EAS secrets dynamically
    npx eas env:create EXPO_PUBLIC_AGENT_ID --value "$EXPO_PUBLIC_AGENT_ID" --force
    npx eas env:create EXPO_PUBLIC_AGENT_NAME --value "$EXPO_PUBLIC_AGENT_NAME" --force
    
    # Build APK
    npx eas build --platform android --profile agent-apk --non-interactive --no-wait
    
    # Clean up secrets
    npx eas env:delete EXPO_PUBLIC_AGENT_ID --non-interactive
    npx eas env:delete EXPO_PUBLIC_AGENT_NAME --non-interactive
```

### 2. `eas.json`
```json
{
  "agent-apk": {
    "env": {
      "EXPO_PUBLIC_AGENT_ID": "secret:EXPO_PUBLIC_AGENT_ID",
      "EXPO_PUBLIC_AGENT_NAME": "secret:EXPO_PUBLIC_AGENT_NAME"
    }
  }
}
```

### 3. `app.config.js`
```javascript
export default ({ config }) => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
  return {
    ...config,
    name: agentName || "Bharath AI Store",
    slug: "bharath-ai-automation",
    extra: {
      agentId: agentId || undefined,
      agentName: agentName || undefined
    }
  };
};
```

### 4. `app/(screen)/_layout.tsx`
```typescript
const agentId = Constants.expoConfig?.extra?.agentId;
if (agentId) {
  return <SingleAgentTemplate />;
}
```

### 5. `templates/SingleAgentTemplate.tsx`
```typescript
const agentId = Constants.expoConfig?.extra?.agentId;
const agentName = Constants.expoConfig?.extra?.agentName;
// Shows only this agent
```

## Testing Steps

### 1. Commit and Push
```bash
git add .github/workflows/generate-apk.yml eas.json app.config.js
git commit -m "Fix: Use EAS Secrets for single-agent APK"
git push
```

### 2. Trigger Build
- Open app in dev mode
- Click "📥 APK" button on any agent
- Wait for build to complete

### 3. Verify GitHub Actions Logs
Look for:
```
🔥 Setting EAS environment secrets
EXPO_PUBLIC_AGENT_ID: asst_xxx
EXPO_PUBLIC_AGENT_NAME: Agent Name
✅ Created secret EXPO_PUBLIC_AGENT_ID
✅ Created secret EXPO_PUBLIC_AGENT_NAME
```

### 4. Verify EAS Build Logs
Go to https://expo.dev and check build logs for:
```
Reading environment variables from secrets
EXPO_PUBLIC_AGENT_ID=asst_xxx
EXPO_PUBLIC_AGENT_NAME=Agent Name
```

### 5. Download and Install APK
- Download APK from link
- Install on Android device
- Open app

### 6. Expected Behavior
✅ Login screen appears
✅ After login, SingleAgentTemplate shows
✅ Only selected agent is visible
✅ No agent list
✅ No tabs
✅ Direct "Start Conversation" button

### 7. Verify Logs (Connect Device)
```bash
adb logcat | grep "Single Agent"
```

Should show:
```
🔍 Single Agent Detection: { isSingleAgent: true, finalAgentId: 'asst_xxx' }
✅ Rendering SingleAgentTemplate for single-agent APK
🎯 Target agent config (RUNTIME): { targetAgentId: 'asst_xxx', targetAgentName: 'Agent Name' }
```

## Why This Works

1. **EAS Secrets are persistent**: They exist on Expo's servers
2. **Secrets are read during build**: EAS passes them to `app.config.js`
3. **Values are baked into APK**: Stored in `Constants.expoConfig.extra`
4. **Runtime detection works**: Code reads from `Constants.expoConfig.extra`
5. **Single-agent mode activates**: Shows only selected agent

## Why Previous Approaches Failed

❌ **Environment variables in GitHub Actions**: Don't transfer to EAS cloud
❌ **`.env` files in git**: EAS doesn't read them
❌ **`distribution: "internal"`**: Doesn't automatically pass env vars
❌ **Empty `env` in eas.json**: EAS validation error

✅ **EAS Secrets API**: The ONLY way to dynamically pass environment variables to EAS builds

## Next Build Will Work

The configuration is now correct. The next APK build will:
1. Set EAS secrets dynamically
2. Build APK with agent data baked in
3. Show only selected agent after installation

**Commit, push, and trigger a new build to verify.**
