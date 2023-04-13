import fs from 'fs';
import { OpenAI } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import {Tool} from "langchain/tools";

class ChemIDFetchTool extends Tool {
    // TODO: this needs to be re-done and not just use an LLM to fetch stuff
    constructor() {
        super();
        this.name = 'ChemIDFetchTool';
        this.description = 'Retrieves the PDB id or CAS rn for a specific molecule, compound, or protein.';
    }
    
    async _call(arg) {
        const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0.9 });
        const template = "What is the PDB id or CAS rn for the following molecule, compound, or protein: {compound}?";
        const prompt = new PromptTemplate({
          template: template,
          inputVariables: ["compound"],
        });
        const chain = new LLMChain({ llm: model, prompt: prompt });

        const res = await chain.call({ compound: arg });
        return res.text.trim();
    }
}

class RequestPDBGetTool extends Tool {
    constructor() {
        super();
        this.name = 'RequestPDBGetTool';
        this.description = 'Returns a link for retrieving a .pdb file, provided a PDB id';
    }
    
    _call(arg) {
        let out = `https://files.rcsb.org/download/${arg}.pdb`
        return out;
    }
}

class RequestCASGetTool extends Tool {
    constructor() {
        super();
        this.name = 'RequestPDBGetTool';
        this.description = 'Returns a link for retrieving an .sdf file, provided a CAS rn number';
    }
    
    _call(arg) {
        let out = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${arg}/record/SDF?record_type=3d&response_type=save&response_basename=Structure`
        return out;
    }
}

class GenerateCodeTool extends Tool {
    constructor() {
        super();
        this.name = 'GenerateCodeTool';
        this.description = 'Generates code to manipulate a 3dmoljs viewer. The code is generated based on the input.';
    }
    
    async _call(arg) {
        // TODO: add a fixed way of using an API to get structures
        const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0.9 });

        // escape all the curly brackets in the template
        const template = fs.readFileSync('../../prompts/openAI.txt', 'utf8').replace(/{/g, '{{').replace(/}/g, '}}') + '\n{instructions}';

        const prompt = new PromptTemplate({
            inputVariables: ["instructions"],
            template: template,
        });
        const chain = new LLMChain({ llm: model, prompt: prompt });

        const res = await chain.call({ instructions: arg });
        return res;
    }
}

