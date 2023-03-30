const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;
const apiKey = process.env.OPENAI_API_KEY;

// let userInputs = []
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
        let userInput = req.query.prompt;
        let systemPrompt = fs.readFileSync('prompts/openAI.txt', 'utf8');
        let code, lines;
        
        // if activeCode does not exist, read code.txt
        if (activeCode == null) {
          code = fs.readFileSync('prompts/code.txt', 'utf8');
        } else {
          lines = activeCode.split('\n');
          code = fs.readFileSync('prompts/code.txt', 'utf8');
          lines = code.split('\n');
          // add active code above [INSERT CODE HERE]
          lines.splice(lines.indexOf('[INSERT CODE HERE]') - 1, 0, activeCode);
          code = lines.join('\n');
        }

        let prompt = systemPrompt + code + userInput;;

        // Call OpenAI API with user input
        try {
          const response = await openai.createChatCompletion({
              model: 'gpt-3.5-turbo',
              messages: [{
                  role: 'user',
                  content: prompt,
              }],
              max_tokens: 512,
              n: 1,
          });
          activeCode = response.data.choices[0].message.content;
          res.send(activeCode);
          console.log(activeCode)
          } catch (error) {
              console.error(error);
          }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

function createPrompt(userInput) {
    let template = fs.readFileSync('prompts/openAI.txt', 'utf8');
    
    let templateArray = template.split("\n");
    if (modelOutputs.length > 0) {
        let history = modelOutputs.join("\n");
        templateArray[templateArray.length - 6] = history;
    } else {
      // remove the item from the array
        templateArray.pop(templateArray.length - 6);
    }
    template = templateArray.join("\n");
    
    let prompt = template + userInput;
    console.log(template)
    return prompt
}