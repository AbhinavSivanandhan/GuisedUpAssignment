import Constants from 'expo-constants';

type AppExtra = {
  apiBaseUrl?: string;
  developmentToken?: string;
  developerMode?: boolean | string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

function parseBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  return value?.toLowerCase() === 'true';
}

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? 'http://localhost:8000',
  developmentToken: process.env.EXPO_PUBLIC_SANCTUM_TOKEN ?? extra.developmentToken ?? '',
  developerMode: parseBoolean(process.env.EXPO_PUBLIC_DEVELOPER_MODE ?? extra.developerMode)
};
