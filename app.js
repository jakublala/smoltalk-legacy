import express from 'express';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { executor } from './src/agent/agent.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const port = 3000;
const apiKey = process.env.OPENAI_API_KEY;

let modelOutputs = []

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve files with correct content type
app.use(express.static(__dirname, {
    setHeaders: function(res, path) {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.txt')) {
        res.setHeader('Content-Type', 'txt/plain');
      } else if (path.endsWith('.cube')) {
        res.setHeader('Content-Type', 'txt/plain');
      }
    }
}));

// Configure OpenAI API
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

// Handle the API request
app.get('/api/generate', async (req, res) => {
    try {
        // Get user input from query string
        let input = req.query.prompt;

        // Create the prompt
        input = fs.readFileSync('prompts/langchain-agent.txt', 'utf8') + input;

        let modelOutput = await executor.call({ input });

        // store modelOutput inside a json file
        fs.writeFileSync('modelOutput.json', JSON.stringify(modelOutput, null, 2));

        let observation = modelOutput.intermediateSteps[modelOutput.intermediateSteps.length - 1].observation.text.trim();

        modelOutputs.push(observation)
        res.send(observation);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
