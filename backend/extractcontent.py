import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin  # To handle relative URLs properly

def get_url(pass_url: str):
    

    # Send HTTP request to the website
    url = pass_url  # Replace with the target website URL
    response = requests.get(url)

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    searchlinks = set()
    links = soup.find_all('a', href=True)  # Only those with 'href' attribute

    # Extract all unique links
    for link in links:
        href = link['href']
        full_url = urljoin(url, href)  # Combine the base URL with the relative URL
        searchlinks.add(full_url)

    # Print all unique links
    print("Unique Links Found:")
    for page_url in searchlinks:
        print(page_url)

    # Scrape content from each link and accumulate the text
    page_content = ''
    for page_url in searchlinks:
        try:
            page_response = requests.get(page_url)
            page_soup = BeautifulSoup(page_response.text, 'html.parser')
            
            # Extract and clean the text
            page_text = page_soup.get_text()
            
            # Efficiently append the content without memory overload
            page_content += ' '.join(page_text.split()) + "\n"  # Concatenate all page text

        except Exception as e:
            print(f"Error scraping {page_url}: {e}")

    # Print the scraped content from all pages (limited output for testing)
    print("\nPage Content Scraped:")
    print(page_content[:1000])  # Print only the first 1000 characters for testing

    # Optionally, write to a file to avoid memory overload
    with open('scraped_content.txt', 'w', encoding='utf-8') as f:
        f.write(page_content)
