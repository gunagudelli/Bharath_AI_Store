// Redux/store/index.ts - Central Store with Thunk & Persist
// Combines userDataReducer; persists to AsyncStorage (whitelist userData).
// Typed RootState for selectors, AppDispatch for dispatch.
// Wrap app in <Provider store={store}> in app/_layout.tsx.

import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userDataReducer from '../reducers/userDataReducer'; // Adjust path
import onboardingReducer from '../reducers/onboardingReducer';

// Root reducer
const rootReducer = combineReducers({
  userData: userDataReducer, // Auth slice
  onboarding: onboardingReducer, // Onboarding slice
  // Add more reducers, e.g., cart: cartReducer
});

// Typed RootState
export type RootState = ReturnType<typeof rootReducer>; // { userData: UserDataState | null }

// Persistence config (save userData only)
import type { PersistConfig } from 'redux-persist';

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['userData', 'onboarding'], // Persist token/ID and onboarding status
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);

// Create store
export const store = createStore(
  persistedReducer,
  applyMiddleware(thunk) // Async support
);

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch; // Typed dispatch

// Default export to satisfy Expo Router
export default store;