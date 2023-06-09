# sMolTalk: natural language interface to 3Dmol.js

[![DOI](https://zenodo.org/badge/621216384.svg)](https://zenodo.org/badge/latestdoi/621216384)

sMolTalk is a proof-of-concept that uses OpenAI's GPT-3.5 to generate 3dmol.js code based on natural language input. 

It was created by [Jakub Lála](https://github.com/jakublala) and [Sean Warren](https://github.com/seankwarren) as a part of the LLM Hackathon in Chemistry.

A demo can be found in a twitter thread [here](https://twitter.com/jakublala/status/1641446457998974979).

<p align="center">
<img src="https://user-images.githubusercontent.com/68380659/232779040-de62bf38-9bfb-476a-9b17-ad2e8886f206.png" width="100%">
</p>

## How to run

1. Install Node.js.
2. Install packages with `npm install`.
3. Create a `.env` file in the directory and add your Open API KEY as `OPENAI_API_KEY=<OPENAI_API_KEY>`
4. Run `node app.js`.
5. Open `http://localhost:3000` in your web browser.

## Usage examples

##### Example 1: Benzene
1. fetch and display the structure of benzene
2. colour the carbons blue
3. make the hydrogen red spheres
4. make them smaller

##### Example 2: Hemoglobin
1. display hemoglobin
3. change cysteine residues to red
4. change their display style to stick

##### Example 3: Molecular Orbitals
1. display oxamic acid
2. display the LUMO orbital at a value of .02
3. display the HOMO orbital at a value of .005

##### Example 4: 7FAK Protein
1. get the 7FAK protein
2. colour the beta sheets to spectrum
3. make the cysteines on the beta sheets into black spheres
4. create the van der waals surface

## Limitations
Note that this implementation is heavily limited by prompt leakage, as GPT-3.5 does not contain much 3dmol.js documentation in its training data. A more reasonable proof-of-concept example would be the use of GPT-4 for generating commands for [PyMOL](https://pymol.org/2/), similar to [this implementation](https://github.com/JinyuanSun/ChatMol). The balance between learning from training data and from few-shot examples is very delicate and it's likely that a reliable model would require both some training data input, as well as in-context learning with augmented retrieval and some few-shot examples to understand the formatting requirements.
