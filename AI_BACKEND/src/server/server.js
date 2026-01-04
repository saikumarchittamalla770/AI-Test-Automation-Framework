import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

import runRoute from './routes/run.js';
import rerunRoute from './routes/rerun.js';
import artifactsRoute from './routes/artifacts.js';
import runTestRoute from './routes/runTest.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug logger – logs all incoming requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/test', (req, res) => {
  console.log('🔥 /test HIT');
  res.send('Express API Working');
});

app.post('/api/generate', runRoute);
app.post('/api/run_test', runTestRoute);
app.post('/api/rerun', rerunRoute);
app.get('/api/artifacts/:workspace', artifactsRoute);

app.get('/health', (req, res) => res.send('ok'));


const port = process.env.PORT || 3335;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
