// Redux/action/index.ts - Action Creators for User Auth
// Typed payloads for AccessToken (full user) and UserID (string ID).
// Use: dispatch(AccessToken(response.data)) in login success.

import { AppDispatch } from "../types";

// import  {ReduxAction}  from '../types'; // Removed to avoid conflict with local declaration

const ACCESSTOKEN = 'ACCESSTOKEN' as const;
const USER_ID = 'USER_ID' as const;

// Generic action type
export type ReduxAction<T = any> = {
  type: typeof ACCESSTOKEN | typeof USER_ID | 'LOGOUT' | 'COMPLETE_ONBOARDING' | 'RESET_ONBOARDING';
  payload: T;
};

// Full user object (from API response)
export interface UserPayload {
  accessToken: string;
  userId: string;
  // Add other fields as needed (e.g., name, email)
  [key: string]: any;
}

// Typed action creator for AccessToken
export const AccessToken = (user: UserPayload): ReduxAction<UserPayload> => ({
  type: ACCESSTOKEN,
  payload: user,
});

// Typed action creator for UserID
export const UserID = (id: string): ReduxAction<string> => ({
  type: USER_ID,
  payload: id,
});

export const logout = (): any => async (dispatch: AppDispatch) => {
  try {
    // Optional: API logout (uncomment if server needs it)
    // await axios.post(`${BASE_URL}auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });

    dispatch({ type: 'LOGOUT' }); // Clear Redux state
    console.log('Logout: Redux cleared');
  } catch (err) {
    console.error('Logout API error:', err);
  }
};

// Onboarding action creators
export const completeOnboarding = (): ReduxAction<null> => ({
  type: 'COMPLETE_ONBOARDING',
  payload: null,
});

export const resetOnboarding = (): ReduxAction<null> => ({
  type: 'RESET_ONBOARDING',
  payload: null,
});