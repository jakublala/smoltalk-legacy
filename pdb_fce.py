import requests
from bs4 import BeautifulSoup

compound = "aspirin"
url = f"https://www.ncbi.nlm.nih.gov/pccompound?term={compound}"

response = requests.get(url)

if response.status_code == 200:
    html_content = response.text
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all elements with class 'rprt'
    rprt_elements = soup.find_all('div', class_='rprt')

    # Get the first element (top entry)
    rprt = rprt_elements[0]

    # Find the 'rprtid' element
    rprtid_element = rprt.find('dl', class_='rprtid')
    cid = rprtid_element.find('dd').text
    print(f"CID: {cid}")
else:
    print("Error fetching the search results. Status code:", response.status_code)
