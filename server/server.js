const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for tasks
let tasks = [
  { id: 1, title: 'Morning meditation and exercise', completed: false, timeBlock: 'morning', isPriority: true, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 2, title: 'Review daily goals and priorities', completed: false, timeBlock: 'morning', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 3, title: 'Deep work session - Project A', completed: false, timeBlock: 'morning', isPriority: true, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 4, title: 'Healthy breakfast and meal prep', completed: false, timeBlock: 'morning', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 5, title: 'Team standup meeting', completed: false, timeBlock: 'afternoon', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 6, title: 'Client presentation preparation', completed: false, timeBlock: 'afternoon', isPriority: true, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 7, title: 'Email and communication block', completed: false, timeBlock: 'afternoon', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 8, title: 'Skill development - Online course', completed: false, timeBlock: 'afternoon', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 9, title: 'Family dinner and quality time', completed: false, timeBlock: 'evening', isPriority: true, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 10, title: 'Evening walk or light exercise', completed: false, timeBlock: 'evening', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 11, title: 'Reading and personal development', completed: false, timeBlock: 'evening', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] },
  { id: 12, title: 'Plan tomorrow\'s schedule', completed: false, timeBlock: 'evening', isPriority: false, createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0] }
];

let nextId = 13;

// Routes

// GET /todos - Get all tasks
app.get('/todos', (req, res) => {
  res.json(tasks);
});

// POST /todos - Add a new task
app.post('/todos', (req, res) => {
  const { title, timeBlock = 'morning', isPriority = false, completed = false, scheduledDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: completed,
    timeBlock: timeBlock,
    isPriority: isPriority,
    createdAt: new Date().toISOString(),
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0]
  };
  
  tasks.push(newTask);
  console.log('Task added:', newTask); // Debug log
  res.status(201).json(newTask);
});

// PUT /todos/:id - Update a task
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed, timeBlock, isPriority } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Update task properties
  if (title !== undefined) {
    tasks[taskIndex].title = title.trim();
  }
  if (completed !== undefined) {
    tasks[taskIndex].completed = completed;
  }
  if (timeBlock !== undefined) {
    tasks[taskIndex].timeBlock = timeBlock;
  }
  if (isPriority !== undefined) {
    tasks[taskIndex].isPriority = isPriority;
  }
  
  console.log('Task updated:', tasks[taskIndex]); // Debug log
  res.json(tasks[taskIndex]);
});

// DELETE /todos/:id - Delete a task
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json(deletedTask);
});

// Export for Vercel serverless
module.exports = app;

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
