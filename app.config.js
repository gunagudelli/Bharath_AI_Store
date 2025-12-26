// app.config.js - Dynamic configuration for agent-specific APKs
export default ({ config }) => {
  const isSingleAgent =
    !!process.env.EXPO_PUBLIC_AGENT_ID &&
    !!process.env.EXPO_PUBLIC_AGENT_NAME;

  return {
    ...config,
    name: isSingleAgent
      ? process.env.EXPO_PUBLIC_AGENT_NAME
      : "Bharath AI Store",
    slug: "bharath-ai-agent",
    owner: "guna123",
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
      agentId: process.env.EXPO_PUBLIC_AGENT_ID || null,
      agentName: process.env.EXPO_PUBLIC_AGENT_NAME || null,
      buildId: process.env.EXPO_PUBLIC_BUILD_ID || null,
      router: {
        origin: false
      },
      eas: {
        projectId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      }
    }
  };
};