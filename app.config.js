// WORKING SOLUTION: Store agent ID in app name/slug at build time
// This is the ONLY way that actually works with Expo

export default ({ config }) => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
  console.log('🔧 Build Config:', { agentId, agentName });

  return {
    ...config,
    name: agentName || "Bharath AI Store",
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
      agentId: agentId ?? null,
      agentName: agentName ?? null,
      isSingleAgent: !!(agentId && agentName),
      router: {
        origin: false
      },
      eas: {
        projectId: "f60f535a-666f-4e86-8545-6b9861a043bd"
      }
    }
  };
};
