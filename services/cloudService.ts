import {Platform} from 'react-native';

const SERVER_PORT = 5000;
const DEFAULT_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

const CLOUD_BASE_URL = `http://${DEFAULT_HOST}:${SERVER_PORT}`;

type QuoteResponse = {
  day: string;
  quote: string;
};

type GuideResponse = {
  title: string;
  steps: string[];
};

export const getDailyQuote = () => {
  return fetch(`${CLOUD_BASE_URL}/quote`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<QuoteResponse>;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
};

export const getAppGuide = () => {
  return fetch(`${CLOUD_BASE_URL}/guide`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<GuideResponse>;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
};

export {CLOUD_BASE_URL};
