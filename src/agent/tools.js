import fs from 'fs';
import { OpenAI } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Tool } from "langchain/tools";
import dotenv from 'dotenv';
import { getPdb, getCID } from '../utils/api.js';

let activeCode = [];

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

class GetPDBTool extends Tool {
    constructor() {
        super();
        this.name = 'GetPDBTool';
        this.description = 'Finds the most relevant PDB ID given a name of a protein, or a protein complex.';
    }
    
    async _call(arg) {
        let out = await getPdb(arg);
        if (out === undefined) {
            out = 'No PDB file found for this name.'
        }
        return out;
    }
}

class GetCASTool extends Tool {
    constructor() {
      super();
      this.name = 'GetCASTool';
      this.description = 'Finds the most relevant CAS ID given a name of a chemical compound.';
    }
  
    async _call(arg) {
      const cid = await getCID(arg);
      if (cid === null) {
        return 'No CAS ID found for this compound name.';
      } else {
        return cid;
      }
    }
  }

class ExecuteCodeTool extends Tool {
  constructor() {
      super();
      this.name = 'ExecuteCodeTool';
      this.description = `Generates code to manipulate a 3dmoljs viewer based on the input. 
      If you need to download the structure, input " PDB ID or PubChem ID | task" , otherwise just give "task" from earlier.`;
      this.generatedCode = [];
  }

  createTemplate() {
      let template = fs.readFileSync('./prompts/langchain-code.txt', 'utf8').replace(/{/g, '{{').replace(/}/g, '}}') + '\n{instructions}';

      let templateArray = template.split("\n");
      if (activeCode.length > 0) {
          templateArray[templateArray.length - 7] = '{activeCode}';
      } else {
          // remove the item from the array
          templateArray.pop(templateArray.length - 7);
      }
      template = templateArray.join("\n");

      return template
  }

  async _call(arg) {
      const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0 , model: "gpt-3.5-turbo"});

      // escape all the curly brackets in the template
      const template = this.createTemplate();

      const prompt = new PromptTemplate({
          inputVariables: ["instructions", "activeCode"],
          template: template,
      });
      const chain = new LLMChain({ llm: model, prompt: prompt });

      console.log('active Code', activeCode.join("\n"))

      const res = await chain.call({ instructions: arg , activeCode: activeCode.join("\n")});

      // add the generated code to the active code
      activeCode.push(res.output);

      return res;
  }
}

class LookAtActiveCode extends Tool {
  constructor() {
      super();
      this.name = 'LookAtActiveCode';
      this.description = 'Always use this tool at the start of the chain.';
  }

  async _call(arg) {
    // if active code is empty
    console.log(activeCode)
    if (activeCode.length === 0) {
      return 'No active code to display.';
    }
    else {
      return activeCode.join("\n");
    }
  }
}

export { LookAtActiveCode, GetPDBTool, GetCASTool, ExecuteCodeTool };