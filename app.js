const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;
// let userInputs = []
// let modelOutputs = []

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
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

// Handle the API request
app.get('/api/generate', async (req, res) => {
    try {
        // Get user input from query string
        let userInput = req.query.prompt;
        // userInputs.push(userInput)
        let prompt = fs.readFileSync('prompts/openAI.txt', 'utf8') + userInput;;

        // Call OpenAI API with user input
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 512,
            n: 1,
            });
        // modelOutput = response.data.choices[0].message.content
        // modelOutputs.push(modelOutput)
        res.send(response.data.choices[0].message.content);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});