#b4636d976c5c6b5b7ee5e73d6287ebf6f9b8ad7b

import requests
import os
import datetime
import subprocess

MODEL_NAME = "deepseek-r1:1.5b"

def summarize_with_deepseek_r1(text, max_words=50):
    prompt = (
        f"Summarize below text in plain English using no more than {max_words} words, no filler:\n\n{text}"
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

def load_all_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["artificial intelligence"]
    lines = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip().strip('",')
            if line:
                lines.append(line)
    if not lines:
        return ["artificial intelligence"]
    return lines

def calculate_paper_relevance(paper, keyword):
    title = paper.get('title','').lower()
    abstract = paper.get('abstract','').lower()
    authors = paper.get('authors', [])
    score = 0.5 * len(authors)
    if keyword.lower() in title:
        score += 2
    if keyword.lower() in abstract:
        score += 1
    return score

def fetch_papers_for_keyword(keyword, page, token, page_size=20, ordering="-date"):
    # Calculate date 2 months ago in YYYY-MM-DD format
    two_months_ago = (datetime.datetime.now() - datetime.timedelta(days=60)).strftime("%Y-%m-%d")
    
    url = "https://paperswithcode.com/api/v1/papers/"
    params = {
        "q": keyword,
        "ordering": ordering,
        "page_size": page_size,
        "page": page,
        "published_since": two_months_ago  # Changed from published_after to published_since
    }
    headers = {
        "Accept": "application/json",
        "Authorization": f"Token {token}"
    }
    print(f"Fetching papers for keyword: {keyword}, page: {page}, published since: {two_months_ago}")
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 200:
        results = resp.json().get("results", [])
        print(f"Found {len(results)} papers for {keyword}")
        return results
    else:
        print(f"Error fetching papers for '{keyword}', page={page}:", resp.status_code, resp.text)
        return []

def get_top_ai_papers_all_keywords(token="b4636d976c5c6b5b7ee5e73d6287ebf6f9b8ad7b", pages_to_fetch=1):
    all_keywords = load_all_keywords()
    print(f"Loaded keywords: {all_keywords}")  # Debug print
    combined = []
    two_months_ago = datetime.datetime.now() - datetime.timedelta(days=60)
    two_months_ago = two_months_ago.replace(hour=0, minute=0, second=0, microsecond=0)
    print(f"Fetching papers published after: {two_months_ago}")  # Debug print

    for kw in all_keywords:
        for pg in range(1, pages_to_fetch + 1):
            papers = fetch_papers_for_keyword(kw, pg, token)
            if not papers:
                continue  # Changed from break to continue to try next keyword
            
            for paper in papers:
                pub_str = paper.get('published','')
                if not pub_str:
                    print(f"No publication date for paper: {paper.get('title')}")  # Debug print
                    continue
                
                try:
                    pub_date = datetime.datetime.strptime(pub_str, "%Y-%m-%d")
                    pub_date = pub_date.replace(hour=0, minute=0, second=0, microsecond=0)
                    print(f"Paper date: {pub_date}, Title: {paper.get('title')}")  # Debug print
                except ValueError as e:
                    print(f"Date parsing error for {pub_str}: {e}")
                    continue
                
                if pub_date >= two_months_ago:  # Changed condition to be more explicit
                    created_at_iso = datetime.datetime.now().isoformat()
                    score = calculate_paper_relevance(paper, kw)
                    combined.append({
                        "keyword": kw,
                        "title": paper.get('title'),
                        "authors": paper.get('authors'),
                        "abstract": paper.get('abstract'),
                        "date": pub_str,
                        "url": paper.get('url_pdf') or paper.get('url_abs'),
                        "relevance_score": score,
                        "image": "No image",
                        "createdAt": created_at_iso
                    })
                    print(f"Added paper: {paper.get('title')}")  # Debug print

    print(f"Total papers found: {len(combined)}")  # Debug print
    if combined:
        combined.sort(key=lambda x: x['relevance_score'], reverse=True)
        top_10 = combined[:10]
        for item in top_10:
            txt = f"{item['title']}\n{item['abstract']}"
            item["summary_50_words"] = summarize_with_deepseek_r1(txt, 50)
        return top_10
    return []

def store_papers_in_db(items, endpoint="http://localhost:5001/api/paper-resources"):
    payload = []
    for it in items:
        payload.append({
            "title": it["title"],
            "link":  it["url"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": ", ".join(it["authors"]) if it["authors"] else "Unknown",
            "createdAt": it["createdAt"]
        })
    try:
        resp = requests.post(endpoint, json=payload)
        resp.raise_for_status()
        print("Inserted Papers data:", resp.json())
    except Exception as ex:
        print("Error inserting paper data:", ex)

if __name__=="__main__":
    token="b4636d976c5c6b5b7ee5e73d6287ebf6f9b8ad7b"
    papers = get_top_ai_papers_all_keywords(token=token, pages_to_fetch=3)
    if papers:
        store_papers_in_db(papers)
    else:
        print("No papers found (past 2 months).")