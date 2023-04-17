import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const compound = "aspirin";
const url = `https://www.ncbi.nlm.nih.gov/pccompound?term=${compound}`;

fetch(url)
  .then(response => {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(`Error fetching the search results. Status code: ${response.status}`);
    }
  })
  .then(html => {
    const { window } = new JSDOM(html);
    const { document } = window;

    // Find all elements with class 'rprt'
    const rprtElements = document.querySelectorAll('.rprt');

    // Get the first element (top entry)
    const rprt = rprtElements[0];

    // Find the 'rprtid' element
    const rprtidElement = rprt.querySelector('.rprtid');
    const cid = rprtidElement.querySelector('dd').textContent;
  })
  .catch(error => console.error(error));
