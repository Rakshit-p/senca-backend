import re
import os
import datetime
import requests
import subprocess

MODEL_NAME = "deepseek-r1:1.5b"

def summarize_with_deepseek_r1(text, max_words=75):
    prompt = (
        f"Summarize what this AI tool does in {max_words} words or less, focusing on its main features and use cases:\n\n{text}"
    )
    try:
        result = subprocess.run(
            ["ollama", "run", MODEL_NAME, prompt],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()
        
        # Extract only the summary, removing the thinking process
        if "<think>" in output and "</think>" in output:
            parts = output.split("</think>")
            if len(parts) > 1:
                return parts[-1].strip()
        return output
    except Exception as e:
        return f"Error: {e}"

def extract_tools_from_section(content, section_marker, next_section_marker=None):
    try:
        # Find the section
        start_idx = content.find(section_marker)
        if start_idx == -1:
            return []
        
        # Find the end of the section
        if next_section_marker:
            end_idx = content.find(next_section_marker, start_idx)
            if end_idx == -1:
                section_content = content[start_idx:]
            else:
                section_content = content[start_idx:end_idx]
        else:
            section_content = content[start_idx:]
        
        # Extract tools using regex pattern for markdown links
        tools = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', section_content)
        return tools[:2]  # Return only top 2 tools
    except Exception as e:
        print(f"Error extracting tools from section {section_marker}: {e}")
        return []

def read_markdown_file(filepath='tools1.md'):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading markdown file: {e}")
        return ""

def get_ai_tools():
    content = read_markdown_file()
    if not content:
        return []

    sections = {
        "## Text": "### Models",
        "## Code": "## Image",
        "## Image": "## Video",
        "## Video": "## Audio",
        "## Audio": "### AI Voice Cloning",
        "### Marketing AI Tools": "### Phone Calls",
        "### Phone Calls": "### Speech"
    }

    all_tools = []
    
    for section, next_section in sections.items():
        tools = extract_tools_from_section(content, section, next_section)
        for name, link in tools:
            # Skip if the tool is a category or section header
            if any(header in name for header in ["#", "Contents", "Models"]):
                continue
                
            # Clean the name and link
            name = name.strip()
            link = link.strip()
            
            # Generate summary for the tool
            summary = summarize_with_deepseek_r1(f"Describe the AI tool {name} located at {link}")
            
            created_at_iso = datetime.datetime.now().isoformat()
            
            all_tools.append({
                "title": name,
                "link": link,
                "summary": summary,
                "createdAt": created_at_iso
            })

    return all_tools

def store_tools_in_db(items, endpoint="http://localhost:5001/api/tools1-resources"):
    if not items:
        print("No items to store in database")
        return
        
    try:
        # First check if the server is running
        base_url = endpoint.rsplit('/', 1)[0]
        requests.get(base_url)
        
        resp = requests.post(endpoint, json=items)
        resp.raise_for_status()
        print(f"Successfully inserted {len(items)} AI tools")
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to server at {endpoint}")
        print("Please ensure your backend server is running on port 5001")
    except requests.exceptions.HTTPError as ex:
        print(f"HTTP Error: {ex}")
        print("Please check if the API endpoint path is correct")
    except Exception as ex:
        print(f"Error inserting AI tools data: {ex}")

if __name__ == "__main__":
    try:
        tools = get_ai_tools()
        if tools:
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:5001/api/tools1-resources')
            store_tools_in_db(tools, backend_url)
        else:
            print("No AI tools found.")
    except Exception as e:
        print(f"Error: {e}")
