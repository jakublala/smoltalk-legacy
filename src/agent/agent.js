import { OpenAI } from "langchain/llms";
import { initializeAgentExecutor } from "langchain/agents";
import { ChemIDFetchTool, RequestPDBGetTool, RequestCASGetTool, GenerateCodeTool } from './tools.js';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const tools = [
  new ChemIDFetchTool(),
  new RequestPDBGetTool(),
  new RequestCASGetTool(),
  new GenerateCodeTool(),
];

const model = new OpenAI({openAIApiKey: apiKey, temperature: 0 });

export const executor = await initializeAgentExecutor(
  tools,
  model,
  "zero-shot-react-description",
  {verbose: true}
);

