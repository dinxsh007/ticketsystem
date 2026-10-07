const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const tickets = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ticket system API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tickets', (req, res) => {
  try {
    const sortedTickets = [...tickets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sortedTickets);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
});

app.post('/api/tickets', (req, res) => {
  try {
    const { title, description, category, priority, customerName, email } = req.body;

    if (!title || !description || !category || !priority || !customerName || !email) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const ticket = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      priority: String(priority).trim(),
      customerName: String(customerName).trim(),
      email: String(email).trim(),
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    tickets.unshift(ticket);

    res.status(201).json({
      message: 'Ticket submitted successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not save ticket',
      error: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startAppServer(port) {
  const server = app.listen(port, () => {
    console.log(`Ticket app running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${fallbackPort}...`);
      startAppServer(fallbackPort);
      return;
    }

    console.error('Server startup error:', error.message);
    process.exit(1);
  });

  return server;
}

if (require.main === module) {
  startAppServer(PORT);
}

module.exports = app;
