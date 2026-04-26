import {Platform} from 'react-native';

const SERVER_PORT = 5000;
const DEFAULT_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

const CLOUD_BASE_URL = `http://${DEFAULT_HOST}:${SERVER_PORT}`;
const REQUEST_TIMEOUT_MS = 2500;

type QuoteResponse = {
  day: string;
  quote: string;
};

type GuideResponse = {
  title: string;
  steps: string[];
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Cloud request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {signal: controller.signal});
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getDailyQuote = async () => {
  const response = await fetchWithTimeout(`${CLOUD_BASE_URL}/quote`);
  return parseResponse<QuoteResponse>(response);
};

export const getAppGuide = async () => {
  const response = await fetchWithTimeout(`${CLOUD_BASE_URL}/guide`);
  return parseResponse<GuideResponse>(response);
};

export {CLOUD_BASE_URL};
