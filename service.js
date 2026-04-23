const http = require('http');
const {URL} = require('url');

const PORT = 3000;

const quotesByDay = {
  Monday: 'Write it down before it slips away.',
  Tuesday: 'Small notes build big progress.',
  Wednesday: 'Capture the thought while it is clear.',
  Thursday: 'Organized notes make busy days easier.',
  Friday: 'End the week with your priorities written down.',
  Saturday: 'Store ideas now and relax later.',
  Sunday: 'Plan ahead with simple, focused notes.',
};

const guide = {
  title: 'Note Taking App Guide',
  steps: [
    'Create a new note by clicking the "New Note" button.',
    'Organize your notes into folders for easy access.',
    'Use pinning to keep important notes at the top of your list.',
    'Search for notes using keywords to quickly find what you need.',
    'Use note templates to save time on recurring note formats.',
    'Edit your account details from the profile screen when needed.',
  ],
};

const dayFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long'});

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
};

const server = http.createServer((request, response) => {
  if (!request.url) {
    sendJson(response, 400, {error: 'Invalid request'});
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/quote') {
    const today = dayFormatter.format(new Date());
    sendJson(response, 200, {
      day: today,
      quote: quotesByDay[today],
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/guide') {
    sendJson(response, 200, guide);
    return;
  }

  sendJson(response, 404, {error: 'Route not found'});
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local cloud service running at http://0.0.0.0:${PORT}`);
});
