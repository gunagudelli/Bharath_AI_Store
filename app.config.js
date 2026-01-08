// app.config.js - Dynamic configuration for agent-specific APKs
export default ({ config }) => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  const buildId = process.env.EXPO_PUBLIC_BUILD_ID;
  
  const isSingleAgent = !!(agentId && agentName && agentId !== '{}' && agentName !== '{}');
  
  // 🔥 CRITICAL DEBUG: Log all environment variables
  console.log('🔍 Environment Variables Debug:', {
    EXPO_PUBLIC_AGENT_ID: process.env.EXPO_PUBLIC_AGENT_ID,
    EXPO_PUBLIC_AGENT_NAME: process.env.EXPO_PUBLIC_AGENT_NAME,
    EXPO_PUBLIC_BUILD_ID: process.env.EXPO_PUBLIC_BUILD_ID,
    NODE_ENV: process.env.NODE_ENV,
    EAS_BUILD: process.env.EAS_BUILD
  });
  
  console.log('🔧 App Config Result:', {
    agentId,
    agentName,
    buildId,
    isSingleAgent
  });

  return {
    ...config,
    name: "Bharath AI Store",
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
      bundleIdentifier: "com.bharath.store"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      package: "com.bharath.store"
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