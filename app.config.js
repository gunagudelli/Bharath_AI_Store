// app.config.js - Static configuration (agent data read at RUNTIME)
export default ({ config }) => {
  // ❌ DON'T read agent data here - not available at build time!
  // ✅ Agent data will be read at RUNTIME using process.env.EXPO_PUBLIC_*
  
  console.log('🔧 App Config - Build Time (agent data NOT available here)');

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
      // ✅ These will be populated at RUNTIME, not build-time
      router: {
        origin: false
      },
      eas: {
        projectId: "14004560-1bb5-4a05-ac04-1ab1c0c47473"
      }
    }
  };
};
