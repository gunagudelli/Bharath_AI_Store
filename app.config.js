// app.config.js - Inject agent data at BUILD TIME
export default ({ config }) => {
  // ✅ Read from environment at BUILD TIME (GitHub Actions)
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  const buildId = process.env.EXPO_PUBLIC_BUILD_ID;
  
  console.log('🔧 App Config - Build Time:', {
    agentId,
    agentName,
    buildId
  });

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
      // ✅ BAKE agent data into APK at build time (only if valid)
      agentId: (agentId && agentId !== 'undefined') ? agentId : undefined,
      agentName: (agentName && agentName !== 'undefined') ? agentName : undefined,
      buildId: (buildId && buildId !== 'undefined') ? buildId : undefined,
      router: {
        origin: false
      },
      eas: {
        projectId: "14004560-1bb5-4a05-ac04-1ab1c0c47473"
      }
    }
  };
};
