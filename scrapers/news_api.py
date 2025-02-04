#1e53bea92bb74791b88e5122bd3deb40

import requests
import os
import datetime
import subprocess
import time

MODEL_NAME = "deepseek-r1:1.5b"

def summarize_with_deepseek_r1(text, max_words=50):
    prompt = (
        f"Summarize below text in plain English using no more than {max_words} words, no filler:\n\n{text}"
    )
    try:
        result = subprocess.run(
            ["ollama","run", MODEL_NAME, prompt],
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

def load_all_newsapi_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["artificial intelligence"]
    lines = []
    with open(filepath,'r',encoding='utf-8') as f:
        for line in f:
            kw = line.strip().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["artificial intelligence"]
    return lines

def calculate_blog_relevance(article,keyword):
    title = article.get('title','').lower()
    desc  = article.get('description','').lower()
    source_name = article.get('source',{}).get('name','').lower()
    trusted = ["techcrunch","mit technology review","venturebeat","wired"]
    score=0
    if keyword.lower() in title:
        score+=2
    if keyword.lower() in desc:
        score+=1
    if any(ts in source_name for ts in trusted):
        score+=2
    return score

def fetch_newsapi_for_keyword(keyword, api_key, page=1, from_date=None, to_date=None):
    url = 'https://newsapi.org/v2/everything'
    params = {
        'q': keyword,
        'from': from_date,
        'to': to_date,
        'sortBy': 'popularity',
        'apiKey': api_key,
        'language': 'en',
        'pageSize': 20,
        'page': page
    }
    try:
        resp = requests.get(url, params=params)
        if resp.status_code == 200:
            return resp.json().get('articles', [])
        else:
            print(f"Error fetching NewsAPI for '{keyword}', page={page}:",
                  resp.status_code, resp.text)
            return []
    except Exception as e:
        print("Exception fetching NewsAPI:", e)
        return []

def get_top_ai_blogs_all_keywords(api_key="1e53bea92bb74791b88e5122bd3deb40", pages=1):
    all_keywords = load_all_newsapi_keywords()
    combined = []
    from_date = (datetime.datetime.now() - datetime.timedelta(days=3)).strftime('%Y-%m-%d')
    to_date   = datetime.datetime.now().strftime('%Y-%m-%d')

    for kw in all_keywords:
        for pg in range(1, pages + 1):
            articles = fetch_newsapi_for_keyword(kw, api_key, pg, from_date, to_date)
            if not articles:
                break
            for art in articles:
                score = calculate_blog_relevance(art, kw)
                image_url = art.get('urlToImage') or "No image"

                created_at_iso = datetime.datetime.now().isoformat()

                combined.append({
                    "keyword": kw,
                    "title": art.get('title', 'No Title'),
                    "author": art.get('author', 'Unknown'),
                    "publishedAt": art.get('publishedAt',''),
                    "source": art.get('source',{}).get('name','Unknown'),
                    "description": art.get('description',''),
                    "url": art.get('url','No URL'),
                    "image": image_url,
                    "relevance_score": score,
                    "createdAt": created_at_iso
                })

    combined.sort(key=lambda x: x['relevance_score'], reverse=True)
    top_10 = combined[:10]

    for item in top_10:
        sum_txt = f"{item['title']} from {item['source']}: {item['description']}"
        item["summary_50_words"] = summarize_with_deepseek_r1(sum_txt, 50)

    return top_10

def store_newsapi_in_db(items, endpoint="http://localhost:5001/api/newsapi-resources", max_retries=3, timeout=10):
    payload = []
    for it in items:
        payload.append({
            "title": it["title"],
            "link":  it["url"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": it["author"] if it["author"] else it["source"],
            "createdAt":  it["createdAt"]
        })
    
    for attempt in range(max_retries):
        try:
            r = requests.post(
                endpoint, 
                json=payload, 
                timeout=timeout,
                headers={'Content-Type': 'application/json'}
            )
            r.raise_for_status()
            print("Inserted NewsAPI data:", r.json())
            return True
        except requests.exceptions.ConnectionError as ce:
            print(f"Connection error (attempt {attempt + 1}/{max_retries}): {ce}")
            if attempt == max_retries - 1:
                print(f"Failed to connect after {max_retries} attempts. Is the API server running at {endpoint}?")
                return False
            time.sleep(2 ** attempt)  # Exponential backoff
        except Exception as ex:
            print(f"Error inserting NewsAPI data (attempt {attempt + 1}/{max_retries}): {ex}")
            if attempt == max_retries - 1:
                return False
            time.sleep(2 ** attempt)

if __name__=="__main__":
    api_key = os.getenv("NEWS_API_KEY", "1e53bea92bb74791b88e5122bd3deb40")
    api_endpoint = os.getenv("API_ENDPOINT", "http://localhost:5001/api/newsapi-resources")
    
    results = get_top_ai_blogs_all_keywords(api_key=api_key, pages=1)
    if results:
        success = store_newsapi_in_db(results, endpoint=api_endpoint)
        if not success:
            print("Failed to store articles in database.")
    else:
        print("No articles found (past 3 days).")