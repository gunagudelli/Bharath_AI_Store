// Config.tsx - TypeScript version of the original JS config
// This module exports the BASE_URL based on userStage and the userStage itself.
// Note: The function parameters 'value' and 'value1' are unused in the logic.
// If they are intended for future use, keep them; otherwise, they could be removed for clarity.

const config = (value?: unknown, value1?: unknown): string => {  // ✅ Fix: Made params optional with '?'
  const userStage: string = "test1"; // Internal userStage for BASE_URL determination
  
  let BASE_URL: string;
  if (userStage === "test1") {
    // Live
    BASE_URL = 'https://meta.oxyloans.com/api/';
  } else {
    // Test
    BASE_URL = 'https://meta.oxyglobal.tech/api/';
  }
  
  // console.log(BASE_URL); // Uncomment if needed for debugging
  
  return BASE_URL;
};

export const userStage = "test1";

export default config(); // Immediate invocation returns the BASE_URL string