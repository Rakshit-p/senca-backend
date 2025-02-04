import requests
import os
import datetime
import subprocess
import json

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

def load_all_github_keywords(filepath='ai4_keywords.txt'):
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

def calculate_repo_relevance(stars,forks):
    return stars + 2 * forks

def fetch_github_repos_for_keyword(keyword):
    one_week_ago = (datetime.datetime.now() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    q_string = f"{keyword} created:>{one_week_ago}"
    url = "https://api.github.com/search/repositories"
    params = {
        "q": q_string,
        "sort": "stars",
        "order": "desc",
        "per_page": 10
    }
    headers = {"Accept":"application/vnd.github.v3+json"}
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 200:
        return resp.json().get('items', [])
    else:
        print(f"Failed to fetch data for '{keyword}':", resp.status_code, resp.text)
        return []

def get_top_ai_projects_all_keywords():
    all_keywords = load_all_github_keywords()
    combined = []

    for kw in all_keywords:
        repos = fetch_github_repos_for_keyword(kw)
        for r in repos:
            stars = r.get('stargazers_count',0)
            forks = r.get('forks_count',0)
            score = calculate_repo_relevance(stars,forks)
            owner = r.get('owner',{})
            image_url = owner.get('avatar_url', "No image")

            created_at_iso = datetime.datetime.now().isoformat()

            combined.append({
                "keyword": kw,
                "name": r.get('name'),
                "url": r.get('html_url'),
                "description": r.get('description'),
                "stars": stars,
                "forks": forks,
                "last_updated": r.get('updated_at'),
                "relevance_score": score,
                "image": image_url,
                "createdAt": created_at_iso
            })

    combined.sort(key=lambda x:x['relevance_score'], reverse=True)
    top_10 = combined[:10]
    for item in top_10:
        text_for_summary = f"{item['name']}:\n{item['description']}"
        item["summary_50_words"] = summarize_with_deepseek_r1(text_for_summary, 50)
    return top_10

def store_github_in_db(items, endpoint="http://localhost:5001/api/github-resources"):
    payload = []
    for it in items:
        payload.append({
            "title": it["name"],
            "link":  it["url"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": "Repo Owner",  # or you can do r["owner"].get("login")
            "createdAt": it["createdAt"]
        })
    try:
        resp = requests.post(endpoint, json=payload)
        resp.raise_for_status()
        print("Inserted GitHub data:", resp.json())
    except Exception as ex:
        print("Error inserting GitHub data:", ex)

if __name__=="__main__":
    results = get_top_ai_projects_all_keywords()
    if results:
        store_github_in_db(results)
    else:
        print("No projects found in the past week.")

