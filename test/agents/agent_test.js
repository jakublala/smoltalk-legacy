import express from 'express';
import { OpenAI } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { initializeAgentExecutor } from "langchain/agents";
import { 
    Tool,
    SerpAPI, 
    Calculator, 
    RequestsGetTool, 
    RequestsPostTool, 
} from "langchain/tools";

const app = express();
const port = 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


// const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0.9 });
// const template = "What is the PDB id or CAS rn for the following molecule, compound, or protein: {compound}?";
// const prompt = new PromptTemplate({
//   template: template,
//   inputVariables: ["compound"],
// });
// const chain = new LLMChain({ llm: model, prompt: prompt });

// const res = await chain.call({ compound: "benzene" });
// console.log(res);

const model = new OpenAI({openAIApiKey: apiKey, temperature: 0 });

class ChemIDFetchTool extends Tool {
    constructor() {
        super();
        this.name = 'ChemIDFetchTool';
        this.description = 'Retrieves the PDB id or CAS rn for a specific molecule, compound, or protein.';
    }
    
    async _call(arg) {
        console.log("Using ChemIDFetch Tool");
        const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0.9 });
        const template = "What is the PDB id or CAS rn for the following molecule, compound, or protein: {compound}?";
        const prompt = new PromptTemplate({
          template: template,
          inputVariables: ["compound"],
        });
        const chain = new LLMChain({ llm: model, prompt: prompt });

        const res = await chain.call({ compound: arg });
        console.log(res.text)
        return res.text.concat('\n');
    }
}

class RequestPDBGetTool extends Tool {
    constructor() {
        super();
        this.name = 'RequestPDBGetTool';
        this.description = 'Returns a link for retrieving a .pdb file, provided a PDB id';
    }
    
    _call(arg) {
        console.log("Using RequestPDBGet Tool");
        let out = `https://files.rcsb.org/download/${arg}.pdb`
        console.log(out.concat('\n'))
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
        console.log("Using RequestCASGet Tool");
        let out = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${arg}/record/SDF?record_type=3d&response_type=save&response_basename=Structure`
        console.log(out.concat('\n'))
        return out;
    }
}

class GenerateCodeTool extends Tool {
    constructor() {
        super();
        this.name = 'GenerateCodeTool';
        this.description = 'Generates the code to create a rendering of a molecule or protein structure.';
    }
    
    async _call(arg) {
        console.log("Using GenerateCode Tool");
        const model = new OpenAI({ openAIApiKey: apiKey, temperature: 0.9 });
        const template = `Give me the javascript 3dmol.js code (and nothing else, and no comments) that replaces [INSERT CODE HERE] based on the instructions below [END].
        If you do not have the protein or molecule asked for, query it from a database.

        These are examples:

            user input: 
            generate code to display hemoglobin
            response:
            // load pdb file
            let data = $.get("https://files.rcsb.org/download/1A3N.pdb", function(data) {
                viewer.addModel(data, "pdb");
                // zoom to fit molecules and render
                viewer.zoomTo();
                viewer.render();
            });

            user input: 
            generate code to display benzene, fetch the structure if necessary
            response:
            // load pdb file
            let data = $.get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/7732-18-5/record/SDF?record_type=3d&response_type=save&response_basename=Structure", function(data) {
                viewer.addModel(data, "sdf");
                // set the style to cartoon
                viewer.setStyle({}, {stick: {}});
                // zoom to fit molecules and render
                viewer.zoomTo();
                viewer.render();
            });


        [START]
        <div id="viewer" style="height: 600px; width: 800px;"></div>
        <script>
            // create viewer
            var viewer = $3Dmol.createViewer("viewer");
            [INSERT CODE HERE]
        </script>
        [END]
        ` + arg ;

        const prompt = new PromptTemplate({
          template: template,
          inputVariables: [],
        });
        const chain = new LLMChain({ llm: model, prompt: prompt });

        const res = await chain.call();
        console.log(res)
        return res;
    }
}

const tools = [
    new ChemIDFetchTool(), 
    new RequestCASGetTool(),
    // new RequestPDBGetTool(),
    new GenerateCodeTool(),
];

const executor = await initializeAgentExecutor(
  tools,
  model,
  "zero-shot-react-description"
);

const input = "locate where to find an .sdf file for benzene"

console.log(`Executing with input "${input}"...\n`);
const result = await executor.call({ input });

console.log(`Got output ${result.output}\n`);