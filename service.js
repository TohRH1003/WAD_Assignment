const http = require('http');
const {URL} = require('url');

const PORT = 5000;

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
    content:
      'Topic:\nDate:\n\nSummary:\n\nKey Points:\n- \n- \n\nQuestions to Review:\n- ',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    title: 'Meeting Notes',
    content:
      'Meeting Topic:\nDate & Time:\nAttendees:\n\nAgenda:\n- \n\nDiscussion:\n- \n\nAction Items:\n- [ ] ',
  },
  {
    id: 'todo',
    name: 'To-Do List',
    title: 'To-Do List',
    content:
      'Today\'s Priorities:\n- [ ] \n- [ ] \n- [ ] \n\nLater Tasks:\n- [ ] \n- [ ] ',
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    title: 'Daily Journal',
    content:
      'Date:\nMood:\n\nWhat happened today:\n\nWhat I learned:\n\nPlan for tomorrow:',
  },
  {
    id: 'project',
    name: 'Project Plan',
    title: 'Project Plan',
    content:
      'Project Name:\nGoal:\nDeadline:\n\nTasks:\n- \n- \n\nRisks:\n- \n\nNext Step:',
  },
];

const getWordCountFromStoredContent = content => {
  if (!content) return 0;

  let textChunks = [];
  try {
    const parsed = JSON.parse(String(content));
    if (Array.isArray(parsed)) {
      textChunks = parsed.map(segment => String(segment?.text ?? '').trim());
    } else {
      textChunks = [String(content).trim()];
    }
  } catch {
    textChunks = [String(content).trim()];
  }

  return textChunks.join(' ').split(/\s+/).filter(Boolean).length;
};

const calculateNoteStats = notes => {
  const safeNotes = Array.isArray(notes) ? notes : [];
  const wordCounts = safeNotes.map(note => {
    const words = getWordCountFromStoredContent(note?.content);
    return {
      note_id: note?.note_id ?? null,
      title: note?.title || 'Untitled',
      wordCount: words,
    };
  });

  const totalNotes = wordCounts.length;
  const totalWords = wordCounts.reduce((sum, item) => sum + item.wordCount, 0);
  const avgWordsPerNote = totalNotes === 0 ? 0 : Number((totalWords / totalNotes).toFixed(2));

  let longestNote = null;
  let shortestNote = null;
  if (wordCounts.length > 0) {
    longestNote = wordCounts.reduce((prev, current) =>
      current.wordCount > prev.wordCount ? current : prev,
    );
    shortestNote = wordCounts.reduce((prev, current) =>
      current.wordCount < prev.wordCount ? current : prev,
    );
  }

  return {
    totalNotes,
    totalWords,
    avgWordsPerNote,
    longestNote,
    shortestNote,
  };
};

const dayFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long'});

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  if (request.method === 'POST' && url.pathname === '/note-stats') {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const stats = calculateNoteStats(parsed.notes);
        sendJson(response, 200, stats);
      } catch (error) {
        sendJson(response, 400, {error: 'Invalid JSON body'});
      }
    });
    return;
  }

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

  if (request.method === 'GET' && url.pathname === '/templates') {
    sendJson(response, 200, {
      title: 'Note Templates',
      templates: noteTemplates,
    });
    return;
  }

  sendJson(response, 404, {error: 'Route not found'});
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local cloud service running at http://0.0.0.0:${PORT}`);
});
