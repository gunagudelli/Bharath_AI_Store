// app.config.js - Dynamic configuration for agent-specific APKs
export default ({ config }) => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
  const isSingleAgent = !!(agentId && agentName && agentId !== '{}' && agentName !== '{}');
  
  console.log('🔧 App Config:', {
    agentId,
    agentName,
    isSingleAgent
  });

  return {
    ...config,
    name: isSingleAgent ? agentName : "Bharath AI Store",
    slug: "bharath-ai-automation",
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
      bundleIdentifier: isSingleAgent
        ? "com.bharath.agent"
        : "com.bharath.store"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      package: isSingleAgent
        ? "com.bharath.agent"
        : "com.bharath.store"
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
      singleAgent: isSingleAgent,
      isSingleAgent: isSingleAgent,
      agentId: agentId || null,
      agentName: agentName || null,
      buildId: process.env.EXPO_PUBLIC_BUILD_ID || null,
      router: {
        origin: false
      },
      eas: {
        projectId: "14004560-1bb5-4a05-ac04-1ab1c0c47473"
      }
    }
  };
};