import Constants from 'expo-constants';

type AppExtra = {
  apiBaseUrl?: string;
  developmentToken?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? 'http://localhost:8000',
  developmentToken: process.env.EXPO_PUBLIC_SANCTUM_TOKEN ?? extra.developmentToken ?? ''
};
