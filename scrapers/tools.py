import requests
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import datetime
import json
from scrape import summarize_with_deepseek_r1
from webdriver_manager.chrome import ChromeDriverManager
import os

def load_keywords(filename="ai4_keywords.txt"):
    """Load AI-related keywords from file"""
    try:
        # Get the directory of the current script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Construct the full path to the keywords file
        keywords_path = os.path.join(current_dir, filename)
        
        print(f"Loading keywords from: {keywords_path}")
        
        with open(keywords_path, 'r') as f:
            keywords = [line.strip().strip('"').strip(',') for line in f.readlines()]
            keywords = [k.lower() for k in keywords if k]  # Convert to lowercase and remove empty strings
            print(f"Successfully loaded {len(keywords)} keywords")
            return keywords
    except Exception as e:
        print(f"Error loading keywords: {e}")
        print(f"Current working directory: {os.getcwd()}")
        return []

def fetch_supertools():
    """Fetch AI tools from supertools.therundown.ai using Selenium"""
    url = "https://supertools.therundown.ai/"
    
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        print("Setting up ChromeDriver...")
        service = Service(ChromeDriverManager().install())
        
        print("Initializing Chrome...")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print("Navigating to URL:", url)
        driver.get(url)
        
        # Wait for content to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        time.sleep(5)  # Additional wait for dynamic content
        
        return driver
    except Exception as e:
        print(f"Detailed error in fetch_supertools: {str(e)}")
        if 'driver' in locals():
            driver.quit()
        return None

def is_ai_related(text, keywords):
    """Check if the text contains any AI-related keywords"""
    text = text.lower()
    return any(keyword.lower() in text for keyword in keywords)

def parse_tools(driver):
    """Parse the tools using Selenium"""
    tools = []
    keywords = load_keywords()
    print(f"Loaded {len(keywords)} keywords for AI detection")
    
    try:
        print("Starting to parse tools...")
        
        # Find all divs that might contain tool information
        elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'grid')]//div[contains(@class, 'relative')]")
        print(f"Found {len(elements)} potential elements")
        
        for index, element in enumerate(elements, 1):
            try:
                # Scroll element into view
                driver.execute_script("arguments[0].scrollIntoView(true);", element)
                time.sleep(0.5)
                
                # Extract text content
                text_content = element.text
                print(f"Processing element {index} with content: {text_content[:100]}...")  # Preview first 100 chars
                
                # Only process if it contains AI-related keywords
                if is_ai_related(text_content, keywords):
                    try:
                        # Find the link (if it exists)
                        link_elem = element.find_element(By.TAG_NAME, "a")
                        link = link_elem.get_attribute("href")
                        
                        # Find the title and description
                        title_elem = element.find_element(By.XPATH, ".//div[contains(@class, 'font-bold') or contains(@class, 'text-xl')]")
                        desc_elem = element.find_element(By.XPATH, ".//div[contains(@class, 'text-sm') or contains(@class, 'text-gray')]")
                        
                        name = title_elem.text.strip()
                        description = desc_elem.text.strip()
                        
                        if name and link:
                            summary = summarize_with_deepseek_r1(f"{name}: {description}", 50)
                            tools.append({
                                "name": name,
                                "link": link,
                                "summary": summary,
                                "createdAt": datetime.datetime.now().isoformat()
                            })
                            print(f"Successfully added AI tool: {name}")
                    except Exception as e:
                        print(f"Error extracting tool details: {e}")
                        continue
                
            except Exception as e:
                print(f"Error processing element {index}: {e}")
                continue
        
        print(f"Successfully parsed {len(tools)} AI-related tools")
        return tools
                
    except Exception as e:
        print(f"Error parsing tools: {e}")
        print("Page source preview:", driver.page_source[:1000])
        return []
    finally:
        try:
            driver.quit()
        except:
            pass

def store_tools_in_db(tools, endpoint="http://localhost:5001/api/ai-tools"):
    """Store the tools in the database"""
    try:
        response = requests.post(endpoint, json=tools)
        response.raise_for_status()
        print(f"Successfully stored {len(tools)} tools in database")
    except Exception as e:
        print(f"Error storing tools in database: {e}")

def save_tools_to_file(tools, filename="ai_tools.json"):
    """Save tools to a JSON file as backup"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(tools, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved tools to {filename}")
    except Exception as e:
        print(f"Error saving tools to file: {e}")

def scrape_supertools():
    """Main function to scrape and store AI tools"""
    print("Starting scrape_supertools...")
    
    # Fetch the webpage using Selenium
    driver = fetch_supertools()
    if not driver:
        print("❌ Failed to fetch Supertools website")
        return
    
    # Parse the tools
    tools = parse_tools(driver)
    if not tools:
        print("❌ No tools found")
        return
    
    print(f"✅ Found {len(tools)} tools")
    
    # Store in database
    store_tools_in_db(tools)
    
    # Backup to file
    save_tools_to_file(tools)

if __name__ == "__main__":
    scrape_supertools()
