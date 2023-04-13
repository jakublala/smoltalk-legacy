import express from 'express';

const app = express();
const port = 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const input = "display benzene"

console.log(`Executing with input "${input}"...\n`);
const result = await executor.call({ input });

console.log(`Got output ${result.output}\n`);