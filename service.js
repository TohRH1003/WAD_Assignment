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
  {
    id: 'todo',
    name: 'To-Do List',
    title: 'To-Do List',
    content: 'Top Priorities:\n- \n\nTasks:\n- [ ] \n- [ ] \n\nNotes:\n',
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    title: 'Daily Journal',
    content: 'Date:\nMood:\nHighlights:\n- \nChallenges:\n- \nReflection:\n',
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    title: 'Project Plan',
    content: 'Project Name:\nGoal:\nScope:\nMilestones:\n- \nRisks:\n- \nNext Step:\n',
  },
  {
    id: 'lecture',
    name: 'Lecture Notes',
    title: 'Lecture Notes',
    content: 'Course:\nLecture Topic:\nKey Concepts:\n- \nExamples:\n- \nQuestions:\n- ',
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Ideas',
    title: 'Brainstorm Ideas',
    content: 'Problem/Theme:\nIdeas:\n- \n- \n- \nBest Idea:\nWhy:\n',
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    title: 'Weekly Review',
    content: 'Week Of:\nWins:\n- \nLessons Learned:\n- \nCarry-Forward Tasks:\n- \nFocus Next Week:\n',
  },
];

const brainstormingWords = [
  'Innovation',
  'Sustainability',
  'Accessibility',
  'Productivity',
  'Collaboration',
  'Automation',
  'Learning',
  'Wellness',
  'Creativity',
  'Growth',
  'Empathy',
  'Curiosity',
  'Momentum',
  'Resilience',
  'Simplicity',
  'Efficiency',
  'Clarity',
  'Adaptability',
  'Consistency',
  'Ownership',
  'Focus',
  'Insight',
  'Exploration',
  'Discovery',
  'Inclusion',
  'Trust',
  'Balance',
  'Strategy',
  'Execution',
  'Optimization',
  'Transformation',
  'Scalability',
  'Reliability',
  'Security',
  'Quality',
  'Impact',
  'Vision',
  'Purpose',
  'Alignment',
  'Agility',
  'Feedback',
  'Iteration',
  'Design',
  'Storytelling',
  'Leadership',
  'Community',
  'Experiment',
  'Opportunity',
  'Breakthrough',
  'Reflection',
  'Progress',
  'Mindset',
  'Energy',
  'Prioritization',
  'Roadmap',
  'Partnership',
  'Problem-solving',
  'Communication',
  'Engagement',
  'Motivation',
];

const randomImageBaseUrl = 'https://picsum.photos/400/300';



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

const extractTextFromContent = value => {
  if (typeof value !== 'string') {
    return '';
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map(segment => (typeof segment?.text === 'string' ? segment.text : ''))
        .join(' ');
    }
  } catch {
    // Treat as plain text when it is not JSON.
  }

  return value;
};

const countWords = value => {
  const text = extractTextFromContent(value);
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
};

const getRandomItem = items => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
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
        const incomingNotes = Array.isArray(parsed.notes) ? parsed.notes : [];
        const notesWithCounts = incomingNotes.map(note => {
          const wordCount = countWords(note?.content);
          return {
            note_id: note?.note_id ?? null,
            title: typeof note?.title === 'string' && note.title.trim() ? note.title : 'Untitled',
            wordCount,
          };
        });

        const totalNotes = notesWithCounts.length;
        const totalWords = notesWithCounts.reduce((sum, note) => sum + note.wordCount, 0);
        const avgWordsPerNote =
          totalNotes > 0 ? Number((totalWords / totalNotes).toFixed(2)) : 0;

        let longestNote = null;
        let shortestNote = null;

        if (totalNotes > 0) {
          longestNote = notesWithCounts.reduce((longest, current) =>
            current.wordCount > longest.wordCount ? current : longest,
          );
          shortestNote = notesWithCounts.reduce((shortest, current) =>
            current.wordCount < shortest.wordCount ? current : shortest,
          );
        }

        sendJson(response, 200, {
          totalNotes,
          totalWords,
          avgWordsPerNote,
          longestNote,
          shortestNote,
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

  // BRAINSTORM WORD
  if (request.method === 'GET' && url.pathname === '/brainstorm-word') {
    const word = getRandomItem(brainstormingWords);
    sendJson(response, 200, { word });
    return;
  }

  // RANDOM IMAGE
  if (request.method === 'GET' && url.pathname === '/random-image') {
    const imageUrl = `${randomImageBaseUrl}?t=${Date.now()}`;
    sendJson(response, 200, { imageUrl });
    return;
  }

  // PUT /notes/:id/images
  const imagesMatch = url.pathname.match(/\/notes\/(.+)\/images/);
  if (request.method === 'PUT' && imagesMatch) {
    const noteId = imagesMatch[1];
    let body = '';

    request.on('data', chunk => { body += chunk; });

    request.on('end', () => {
      try {
        const { images } = JSON.parse(body);

        // 1. Find the note in your in-memory 'notes' array
        const noteIndex = notes.findIndex(n => n.id === noteId);

        if (noteIndex !== -1) {
          // 2. Update the images array for that specific note
          notes[noteIndex].images = images;

          console.log(`Cloud: Images updated for note ID: ${noteId}`);
          sendJson(response, 200, {
            success: true,
            message: 'Images synced to cloud',
            currentImages: notes[noteIndex].images
          });
        } else {
          // 3. If note doesn't exist in cloud yet, create a skeleton for it
          const newNote = {
            id: noteId,
            title: 'Synced from Device',
            images: images,
            content: ''
          };
          notes.push(newNote);
          sendJson(response, 201, { success: true, message: 'Note created in cloud with images' });
        }
      } catch (e) {
        sendJson(response, 400, { error: 'Invalid JSON body' });
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
