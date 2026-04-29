const http = require('http');
const { URL } = require('url');

const PORT = 5000;

let notes = []; // in-memory storage

// ---------------- EXISTING DATA ---------------- //

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

const noteTemplates = [
  {
    id: 'study',
    name: 'Study Notes',
    title: 'Study Notes',
    content: 'Topic:\nSummary:\nKey Points:\n- ',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    title: 'Meeting Notes',
    content: 'Meeting Notes:\nAction Items:\n- ',
  },
];



// ---------------- HELPERS ---------------- //

const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
};

// ---------------- SERVER ---------------- //

const server = http.createServer((request, response) => {

  if (!request.url) {
    sendJson(response, 400, { error: 'Invalid request' });
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  // ================= NOTES CRUD ================= //

  // GET ALL NOTES
  if (request.method === 'GET' && url.pathname === '/notes') {
    sendJson(response, 200, notes);
    return;
  }

  // ADD NOTE
  if (request.method === 'POST' && url.pathname === '/notes') {
    let body = '';

    request.on('data', chunk => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        const note = JSON.parse(body);

        note.id = note.id || Date.now().toString();
        note.images = note.images || []; //multiple images support

        notes.push(note);

        sendJson(response, 200, { message: 'Note added', note });
      } catch {
        sendJson(response, 400, { error: 'Invalid JSON' });
      }
    });

    return;
  }

  // UPDATE NOTE
  if (request.method === 'PUT' && url.pathname.startsWith('/notes/')) {
    const id = url.pathname.split('/')[2];
    let body = '';

    request.on('data', chunk => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        const updated = JSON.parse(body);

        notes = notes.map(n =>
          n.id === id ? { ...n, ...updated } : n
        );

        sendJson(response, 200, { message: 'Updated' });
      } catch {
        sendJson(response, 400, { error: 'Invalid JSON' });
      }
    });

    return;
  }

  // DELETE NOTE
  if (request.method === 'DELETE' && url.pathname.startsWith('/notes/')) {
    const id = url.pathname.split('/')[2];

    notes = notes.filter(n => n.id !== id);

    sendJson(response, 200, { message: 'Deleted' });
    return;
  }

  // ================= EXISTING FEATURES ================= //

  // NOTE STATS
  if (request.method === 'POST' && url.pathname === '/note-stats') {
    let body = '';

    request.on('data', chunk => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const totalNotes = parsed.notes?.length || 0;

        sendJson(response, 200, {
          totalNotes,
          message: 'Stats calculated',
        });
      } catch {
        sendJson(response, 400, { error: 'Invalid JSON body' });
      }
    });

    return;
  }

  // QUOTE
  if (request.method === 'GET' && url.pathname === '/quote') {
    const today = dayFormatter.format(new Date());

    sendJson(response, 200, {
      day: today,
      quote: quotesByDay[today],
    });
    return;
  }

  // GUIDE
  if (request.method === 'GET' && url.pathname === '/guide') {
    sendJson(response, 200, guide);
    return;
  }

  // TEMPLATES
  if (request.method === 'GET' && url.pathname === '/templates') {
    sendJson(response, 200, {
      title: 'Note Templates',
      templates: noteTemplates,
    });
    return;
  }

  // PUT /notes/:id/images
  const imagesMatch = url.pathname.match(/\/notes\/(.+)\/images/);
  if (request.method === 'PUT' && imagesMatch) {
    const noteId = imagesMatch[1];
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      const { images } = JSON.parse(body);

      // Find the note in your "database" and update its images array
      const noteIndex = notesDatabase.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        notesDatabase[noteIndex].images = images;
        console.log(`Images updated for note ${noteId}`);
        sendJson(response, 200, { success: true });
      } else {
        sendJson(response, 404, { error: 'Note not found' });
      }
    });
    return;
  }

  // NOT FOUND
  sendJson(response, 404, { error: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local cloud service running at http://0.0.0.0:${PORT}`);
});