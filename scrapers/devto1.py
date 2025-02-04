#GZp9a51ySYuU3gPLsvhy1

import requests
import os
import datetime
import subprocess

MODEL_NAME = "deepseek-r1:1.5b"

def summarize_with_deepseek_r1(text, max_words=50):
    """
    Summarize with your local 'ollama run' using the deepseek-r1:1.5b model.
    """
    prompt = (
        f"Summarize below text in plain English using no more than {max_words} words, no filler:\n\n{text}"
    )
    try:
        result = subprocess.run(
            ["ollama", "run", MODEL_NAME, prompt],
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def load_all_devto_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["ai"]
    keywords = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            kw = line.strip().lower().strip('",')
            if kw:
                keywords.append(kw)
    if not keywords:
        return ["ai"]
    return keywords

def calculate_devto_relevance(article, keyword):
    score = 0
    reac = article.get("positive_reactions_count", 0)
    comm = article.get("comments_count", 0)
    score += reac + comm

    title = article.get("title","").lower()
    desc  = article.get("description","").lower()
    if keyword in title:
        score += 2
    if keyword in desc:
        score += 1
    return score

def fetch_devto_for_keyword(keyword, api_key, page=1, per_page=20):
    url = "https://dev.to/api/articles"
    headers = {"api-key": api_key}
    params = {
        "tag": keyword,
        "per_page": per_page,
        "page": page
    }
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 200:
        return resp.json()
    else:
        print(f"Error fetching dev.to (kw='{keyword}', page={page}):",
              resp.status_code, resp.text)
        return []

def get_devto_blogs_all_keywords(api_key="GZp9a51ySYuU3gPLsvhy1", pages_to_fetch=2):
    """
    Past 1 week, top 10. Summaries + images + createdAt.
    """
    all_keywords = load_all_devto_keywords()
    combined = []
    one_week_ago = datetime.datetime.now() - datetime.timedelta(days=7)

    for kw in all_keywords:
        for pg in range(1, pages_to_fetch + 1):
            articles = fetch_devto_for_keyword(kw, api_key, page=pg, per_page=20)
            if not articles:
                break
            for art in articles:
                published_str = art.get("published_at","")
                try:
                    art_date = datetime.datetime.strptime(published_str, "%Y-%m-%dT%H:%M:%SZ")
                except:
                    art_date = datetime.datetime.now()
                if art_date < one_week_ago:
                    continue

                # define createdAt here
                created_at_iso = datetime.datetime.now().isoformat()

                score = calculate_devto_relevance(art, kw)
                combined.append({
                    "keyword": kw,
                    "title": art.get("title", "No Title"),
                    "url": art.get("url", "No URL"),
                    "author": art.get("user", {}).get("username", "Unknown Author"),
                    "description": art.get("description", "No Description"),
                    "relevance_score": score,
                    "image": art.get("cover_image") or "No image",
                    "createdAt": created_at_iso
                })

    # take top 10 by relevance
    combined.sort(key=lambda x: x['relevance_score'], reverse=True)
    top_10 = combined[:10]

    # Summaries
    for item in top_10:
        text_for_sum = f"{item['title']}\n{item['description']}"
        item["summary_50_words"] = summarize_with_deepseek_r1(text_for_sum, 50)

    return top_10

def store_devto_in_db(items, endpoint="http://localhost:5001/api/devto-resources"):
    payload = []
    for it in items:
        payload.append({
            "title":      it["title"],
            "link":       it["url"],
            "image":      it["image"],
            "summary":    it["summary_50_words"],
            "resourceBy": it["author"],
            "createdAt":  it["createdAt"]
        })
    try:
        r = requests.post(endpoint, json=payload)
        r.raise_for_status()
        print("Successfully inserted devto items:", r.json())
    except requests.exceptions.RequestException as exc:
        print("Failed posting devto resources:", exc)

if __name__ == "__main__":
    API_KEY = "GZp9a51ySYuU3gPLsvhy1"
    top_blogs = get_devto_blogs_all_keywords(api_key=API_KEY, pages_to_fetch=2)
    if top_blogs:
        store_devto_in_db(top_blogs)
    else:
        print("No dev.to blogs found in the past week.")