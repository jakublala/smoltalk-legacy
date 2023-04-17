import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function getCID(compound) {
    const url = `https://www.ncbi.nlm.nih.gov/pccompound?term=${compound}`;
  
    try {
      const response = await fetch(url);
  
      if (response.ok) {
        const html = await response.text();
        const { window } = new JSDOM(html);
        const { document } = window;
  
        // Find all elements with class 'rprt'
        const rprtElements = document.querySelectorAll('.rprt');
  
        // Get the first element (top entry)
        const rprt = rprtElements[0];
  
        // Find the 'rprtid' element
        const rprtidElement = rprt.querySelector('.rprtid');
        const cid = rprtidElement.querySelector('dd').textContent;
        return cid;
      } else {
        throw new Error(`Error fetching the search results. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  
    return null;
  }  

export async function getPdb(queryString, name = null) {
    const url = "https://search.rcsb.org/rcsbsearch/v2/query";
    const query = {
      query: {
        type: "terminal",
        service: "full_text",
        parameters: { value: queryString },
      },
      return_type: "entry",
    };
 try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
  
      if (response.ok) {
        const data = await response.json();

  
        if ("result_set" in data && data["result_set"].length > 0) {
          const pdbid = data["result_set"][0]["identifier"];
          return pdbid;
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  
    return null;
  };
  
  