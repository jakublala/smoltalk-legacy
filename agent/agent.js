const apiKey = process.env.OPENAI_API_KEY;

const model = new OpenAI({openAIApiKey: apiKey, temperature: 0 });

const tools = [
    new ChemIDFetchTool(), 
    new RequestCASGetTool(),
    // new RequestPDBGetTool(),
    new GenerateCodeTool(),
];

const executor = await initializeAgentExecutor(
  tools,
  model,
  "zero-shot-react-description",
  {verbose: true}
);
