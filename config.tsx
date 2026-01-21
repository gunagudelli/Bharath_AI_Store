// Config.tsx - Hybrid configuration for development
// Uses original API for agents, local backend for APK generation

const config = (value?: unknown, value1?: unknown): string => {
  const userStage: string = "test1"; // Keep original for agent data
  
  let BASE_URL: string;
  if (userStage === "test1") {
    // Live - for fetching agents
    BASE_URL = 'https://meta.oxyloans.com/api/';
  } else {
    // Test
    BASE_URL = 'https://meta.oxyglobal.tech/api/';
  }
  
  console.log('🔗 Using BASE_URL for agents:', BASE_URL);
  
  return BASE_URL;
};

// Local backend URL for APK generation - use your computer's IP
export const APK_BASE_URL = 'http://192.168.0.134:3000/';

export const userStage = "test1";

export default config(); // Returns original API URL for agents