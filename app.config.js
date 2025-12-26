// app.config.js - Dynamic configuration for agent-specific APKs
export default ({ config }) => {
  // Get agent info from environment variables (set by GitHub Actions)
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  const buildId = process.env.EXPO_PUBLIC_BUILD_ID;

  // Base configuration
  let appConfig = {
    ...config,
    name: agentName ? `${agentName} AI` : "Bharath AI Store",
    slug: agentId ? `bharath-ai-${agentId.toLowerCase().replace(/[^a-z0-9]/g, '')}` : "bharath-ai-store",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: agentId 
        ? `com.bharathai.${agentId.toLowerCase().replace(/[^a-z0-9]/g, '')}` 
        : "com.bharathai.store"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      package: agentId 
        ? `com.bharathai.${agentId.toLowerCase().replace(/[^a-z0-9]/g, '')}` 
        : "com.bharathai.store"
    },
    web: {
      favicon: "./assets/images/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/images/splash-icon.png",
          dark: {
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#ffffff"
          },
          imageWidth: 200
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // 🔥 Agent-specific configuration
      agentId: agentId || null,
      agentName: agentName || null,
      buildId: buildId || null,
      isSingleAgent: !!agentId, // Flag to enable single-agent mode
      router: {
        origin: false
      },
      eas: {
        projectId: "your-project-id" // Replace with your actual EAS project ID
      }
    }
  };

  // Debug logging
  console.log('🔧 App Config Debug:', {
    name: appConfig.name,
    slug: appConfig.slug,
    agentId: agentId,
    agentName: agentName,
    buildId: buildId,
    isSingleAgent: !!agentId,
    bundleId: appConfig.android.package
  });

  return appConfig;
};