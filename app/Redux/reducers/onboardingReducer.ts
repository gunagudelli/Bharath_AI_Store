// Redux/reducers/onboardingReducer.ts - Onboarding State Reducer
// Manages onboarding completion status with persistent storage

import { ReduxAction } from '../action/index';

interface OnboardingState {
  isCompleted: boolean;
}

const initialState: OnboardingState = {
  isCompleted: false,
};

const onboardingReducer = (
  state: OnboardingState = initialState,
  action: ReduxAction
): OnboardingState => {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return { ...state, isCompleted: true };
    case 'RESET_ONBOARDING':
      return { ...state, isCompleted: false };
    default:
      return state;
  }
};

export default onboardingReducer;