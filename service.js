const http = require('http');
const {URL} = require('url');

const PORT = 3000;

const quotesByDay = {
  Monday: 'A small note today can save a big idea tomorrow.',
  Tuesday: 'Keep writing. Progress grows one page at a time.',
  Wednesday: 'Midweek clarity starts with capturing the thought.',
  Thursday: 'Organized notes turn busy days into manageable ones.',
  Friday: 'Finish strong by writing down what matters most.',
  Saturday: 'Rest your mind by storing ideas before they drift away.',
  Sunday: 'Plan the week ahead with notes that keep you focused.',
};

const guide = {
  title: 'Note Taking App Guide',
  steps: [
    'Create an account if you are a new user.',
    'Log in with your username and password.',
    'Open your profile page to review your account details.',
    'Use the guide button anytime if you need a quick reminder.',
    'Start creating folders and notes after login.',
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
