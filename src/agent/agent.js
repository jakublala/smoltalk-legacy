import { OpenAI } from "langchain/llms";
import { AgentExecutor } from "langchain/agents";
import { LookAtActiveCode, GetPDBTool, GetCASTool, ExecuteCodeTool } from './tools.js';
import { BufferMemory } from "langchain/memory";
import { ZeroShotAgent } from "langchain/agents";
import { initializeAgentExecutor } from "langchain/agents";
import { LLMChain } from "langchain/chains";
import fs from 'fs';
// import { getCallbackManager } from "langchain/agent/callbacks/index.js";
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const tools = [
  new LookAtActiveCode(),
  new GetPDBTool(),
  new GetCASTool(),
  new ExecuteCodeTool(),
];

const model = new OpenAI({openAIApiKey: apiKey, temperature: 0.1 , model: "gpt-3.5-turbo"});


const prompt = ZeroShotAgent.createPrompt(tools, {
  prefix: `Your goal is to always finish with generating code.
  Before doing anything, always look at the current active code, so that you adjust your actions accordingly.
  You have access to the following tools:`,
  suffix: `Your specific task is to:`,
});

// save the prompt to a file
console.log(prompt)

const llmChain = new LLMChain({
  prompt: prompt,
  llm: model,
});

// const agent = new ZeroShotAgent({
//   llmChain,
//   allowedTools: tools.map((tool) => tool.name),
// });

const agent = ZeroShotAgent.fromLLMAndTools(model, tools)

export const executor = AgentExecutor.fromAgentAndTools({
  agent: agent,
  tools: tools,
  returnIntermediateSteps: true,
  verbose: true});
  
// export const executor = await initializeAgentExecutor(
//   tools,
//   model,
//   "zero-shot-react-description",
//   {verbose: true}
// );

