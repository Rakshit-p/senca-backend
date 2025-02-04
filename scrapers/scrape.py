import requests
import datetime
import subprocess
from bs4 import BeautifulSoup

MODEL_NAME="deepseek-r1:1.5b"

def summarize_with_deepseek_r1(text, max_words=50):
    prompt=(
        f"Summarize below text in plain English using no more than {max_words} words, no filler:\n\n{text}"
    )
    try:
        result=subprocess.run(
            ["ollama","run",MODEL_NAME,prompt],
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

def load_all_arxiv_keywords(filepath='ai4_keywords.txt'):
    import os
    if not os.path.exists(filepath):
        return ["artificial intelligence","machine learning"]
    lines=[]
    with open(filepath,'r',encoding='utf-8') as f:
        for line in f:
            kw=line.strip().lower().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["artificial intelligence"]
    return lines

def calculate_arxiv_relevance(title, summary, authors, keyword):
    t_lower = title.lower()
    s_lower = summary.lower()
    score   = 0.5 * len(authors)
    if keyword in t_lower:
        score += 2
    if keyword in s_lower:
        score += 1
    return score

def fetch_arxiv_for_keyword(keyword, max_results=10):
    encoded_kw = keyword.replace(" ","+")
    url = (
        f"http://export.arxiv.org/api/query?search_query=all:{encoded_kw}"
        f"&start=0&max_results={max_results}&sortBy=submittedDate&sortOrder=descending"
    )
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            return resp.content
        else:
            print(f"ArXiv fetch error (kw='{keyword}'): {resp.status_code}, {resp.text}")
            return None
    except Exception as e:
        print("Error fetching arXiv:", e)
        return None

def get_recent_ai_papers_all_keywords():
    keywords = load_all_arxiv_keywords()
    combined = []
    last_30_days = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')

    for kw in keywords:
        data = fetch_arxiv_for_keyword(kw, 10)
        if not data:
            continue
        soup = BeautifulSoup(data, 'lxml-xml')
        entries = soup.find_all('entry')
        for entry in entries:
            title = entry.title.text
            summary = entry.summary.text.strip()
            pubdate = entry.published.text[:10]
            authors = [a.find('name').text for a in entry.find_all('author')]
            link = entry.id.text

            if pubdate >= last_30_days:
                created_at_iso = datetime.datetime.now().isoformat()

                score = calculate_arxiv_relevance(title, summary, authors, kw)
                combined.append({
                    "keyword": kw,
                    "title": title,
                    "summary": summary,
                    "published_date": pubdate,
                    "authors": authors,
                    "link": link,
                    "relevance_score": score,
                    "image": "No image",
                    "createdAt": created_at_iso
                })

    combined.sort(key=lambda x:x['relevance_score'], reverse=True)
    top_10 = combined[:10]
    for item in top_10:
        txt_summarize = f"{item['title']}:\n{item['summary']}"
        item["summary_50_words"] = summarize_with_deepseek_r1(txt_summarize, 50)
    return top_10

def store_arxiv_in_db(items, endpoint="http://localhost:5001/api/arxiv-resources"):
    payload=[]
    for it in items:
        resourceBy = it["authors"][0] if it["authors"] else "Unknown"
        payload.append({
            "title": it["title"],
            "link":  it["link"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": resourceBy,
            "createdAt": it["createdAt"]
        })
    import requests
    try:
        r = requests.post(endpoint, json=payload)
        r.raise_for_status()
        print("Inserted arXiv data:", r.json())
    except Exception as ex:
        print("Error inserting arXiv data:", ex)

if __name__=="__main__":
    results = get_recent_ai_papers_all_keywords()
    if results:
        store_arxiv_in_db(results)
    else:
        print("❌ No papers found in the last 30 days.")