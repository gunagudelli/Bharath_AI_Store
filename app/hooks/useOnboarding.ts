// hooks/useOnboarding.ts - Custom hook for onboarding management
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../Redux/types';
import { completeOnboarding, resetOnboarding } from '../Redux/action/index';

export const useOnboarding = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  
  const isCompleted = onboardingState?.isCompleted || false;
  
  const markAsCompleted = () => {
    dispatch(completeOnboarding());
  };
  
  const reset = () => {
    dispatch(resetOnboarding());
  };
  
  return {
    isCompleted,
    markAsCompleted,
    reset,
  };
};

// Default export to satisfy Expo Router
export default useOnboarding;