// Redux/types.ts - Centralized Redux Types for Auth & State Management
// Generic ReduxAction for payloads (e.g., UserPayload for login).
// RootState for selectors (userData slice); AppDispatch for dispatch.
// ✅ Fix: AppDispatch = typeof store.dispatch (infers AnyAction, supports payload).
// ReduxAction extends AnyAction (payload optional for basic actions).

import { AnyAction } from 'redux'; // ✅ Import base type for compatibility

// Generic action type (extends AnyAction for Redux compatibility)
export type ReduxAction<T = any> = AnyAction & {
  type: string; // Action string (e.g., 'ACCESSTOKEN')
  payload?: T; // Typed payload (optional to match UnknownAction)
};

// User data from API (accessToken, userId for auth)
export interface UserDataState {
  accessToken: string;
  userId: string;
  // Expand from getProfile: userName?: string; email?: string; etc.
  [key: string]: any; // Fallback for dynamic API fields
}

// Root store state (userData slice + future ones)
export type RootState = {
  userData: UserDataState | null; // Auth slice (null = unauth)
  // Add more: e.g., cart: CartState;
};

// Import the store to infer dispatch type
import { store } from './store'; // Adjust path if your store is elsewhere

// Typed dispatch (infers from store—supports payload for custom actions)
export type AppDispatch = typeof store.dispatch; // ✅ Fix: typeof store.dispatch (from store/index.ts)