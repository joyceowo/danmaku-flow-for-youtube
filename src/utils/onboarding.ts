type OnboardingState = Record<string, number>

const onboardingStorageKey = 'onboarding'

const getOnboardingState = async (): Promise<OnboardingState> => {
  const result = await chrome.storage.local.get(onboardingStorageKey)
  const state = result[onboardingStorageKey]
  return state && typeof state === 'object' ? state : {}
}

export const hasCompletedOnboarding = async (
  featureId: string,
  version: number
) => {
  const state = await getOnboardingState()
  return (state[featureId] ?? 0) >= version
}

export const completeOnboarding = async (
  featureId: string,
  version: number
) => {
  const state = await getOnboardingState()
  await chrome.storage.local.set({
    [onboardingStorageKey]: {
      ...state,
      [featureId]: version,
    },
  })
}
