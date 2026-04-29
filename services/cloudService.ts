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

type NoteStatsRequestItem = {
  note_id?: number;
  title?: string;
  content?: string;
};

type NoteStatsResponse = {
  totalNotes: number;
  totalWords: number;
  avgWordsPerNote: number;
  longestNote: {note_id: number | null; title: string; wordCount: number} | null;
  shortestNote: {note_id: number | null; title: string; wordCount: number} | null;
};

type CloudTemplate = {
  id: string;
  name: string;
  title: string;
  content: string;
};

type CloudTemplateResponse = {
  title: string;
  templates: CloudTemplate[];
};

export const getDailyQuote = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return fetch(`${CLOUD_BASE_URL}/quote`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<QuoteResponse>;
    })
    .catch(error => {
      if (error?.name === 'AbortError') {
        throw new Error('Cloud request timeout');
      }
      console.error('Error:', error);
      throw error;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};

export const getAppGuide = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return fetch(`${CLOUD_BASE_URL}/guide`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<GuideResponse>;
    })
    .catch(error => {
      if (error?.name === 'AbortError') {
        throw new Error('Cloud request timeout');
      }
      console.error('Error:', error);
      throw error;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};

export const getCloudNoteStats = (notes: NoteStatsRequestItem[]) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return fetch(`${CLOUD_BASE_URL}/note-stats`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({notes}),
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<NoteStatsResponse>;
    })
    .catch(error => {
      if (error?.name === 'AbortError') {
        throw new Error('Cloud request timeout');
      }
      console.error('Error:', error);
      throw error;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};

export const getCloudNoteTemplates = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return fetch(`${CLOUD_BASE_URL}/templates`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Cloud request failed: ${response.status}`);
      }

      return response.json() as Promise<CloudTemplateResponse>;
    })
    .catch(error => {
      if (error?.name === 'AbortError') {
        throw new Error('Cloud request timeout');
      }
      console.error('Error:', error);
      throw error;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};

export {CLOUD_BASE_URL};
