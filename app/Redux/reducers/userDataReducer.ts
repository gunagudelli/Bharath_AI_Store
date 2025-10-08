// Redux/reducers/userDataReducer.ts - User Data Reducer
// Handles ACCESSTOKEN (set full user) and USER_ID (update ID).
// Initial null for unauth; immutable updates (spread).
// Typed state: UserDataState | null.

import { ReduxAction } from '../action/index'; // Adjust path

// Typed state shape
interface UserDataState {
  accessToken: string;
  userId: string;
  // Add other fields from API (e.g., name, email)
  [key: string]: any;
}

const initialState: UserDataState | null = null;

// Typed reducer
const userDataReducer = (
  state: UserDataState | null = initialState,
  action: ReduxAction
): UserDataState | null => {
  switch (action.type) {
    case 'ACCESSTOKEN':
      return { ...action.payload }; // Set full user (immutable spread)
    case 'USER_ID':
      return state ? { ...state, userId: action.payload } : null; // Update ID only
      // In userDataReducer switch
    case 'LOGOUT':
      return null; // ✅ Clear state (immutable)
    default:
      return state;
  }
};

export default userDataReducer;