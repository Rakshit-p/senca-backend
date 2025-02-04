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

def load_all_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["AI"]
    lines = []
    with open(filepath,'r',encoding='utf-8') as f:
        for line in f:
            kw = line.strip().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["AI"]
    return lines

def fetch_hf_datasets_for_keyword(keyword):
    url = "https://huggingface.co/api/datasets"
    params = {
        "search": keyword,
        "sort": "likes",
        "direction": -1,
        "limit": 20
    }
    try:
        r = requests.get(url, params=params)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"Error fetching datasets for '{keyword}':", r.status_code, r.text)
            return []
    except Exception as e:
        print("Exception fetching HF datasets:", e)
        return []

def fetch_hf_spaces_for_keyword(keyword):
    url = "https://huggingface.co/api/spaces"
    params = {
        "search": keyword,
        "sort": "likes",
        "direction": -1,
        "limit": 20
    }
    try:
        r = requests.get(url, params=params)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"Error fetching spaces for '{keyword}':", r.status_code, r.text)
            return []
    except Exception as e:
        print("Exception fetching HF spaces:", e)
        return []

def get_top_datasets_and_spaces_all_keywords():
    two_weeks_ago = datetime.datetime.now() - datetime.timedelta(days=14)
    all_keywords = load_all_keywords()
    ds_combined = []
    sp_combined = []

    for kw in all_keywords:
        ds = fetch_hf_datasets_for_keyword(kw)
        for d in ds:
            last_mod = d.get('lastModified')
            if last_mod:
                try:
                    dt_obj = datetime.datetime.strptime(last_mod, "%Y-%m-%dT%H:%M:%S.%fZ")
                except:
                    dt_obj = datetime.datetime.now()
                if dt_obj < two_weeks_ago:
                    continue
            likes = d.get('likes', 0)

            created_at_iso = datetime.datetime.now().isoformat()

            ds_combined.append({
                "keyword": kw,
                "id": d.get('id'),
                "likes": likes,
                "downloads": d.get('downloads'),
                "lastModified": last_mod,
                "relevance_score": likes,
                "image": "No image",
                "createdAt": created_at_iso
            })
        
        sp = fetch_hf_spaces_for_keyword(kw)
        for s in sp:
            last_mod = s.get('lastModified')
            if last_mod:
                try:
                    dt_obj = datetime.datetime.strptime(last_mod, "%Y-%m-%dT%H:%M:%S.%fZ")
                except:
                    dt_obj = datetime.datetime.now()
                if dt_obj < two_weeks_ago:
                    continue
            likes = s.get('likes', 0)

            created_at_iso = datetime.datetime.now().isoformat()

            sp_combined.append({
                "keyword": kw,
                "id": s.get('id'),
                "likes": likes,
                "views": s.get('viewerCount'),
                "lastModified": last_mod,
                "relevance_score": likes,
                "image": "No image",
                "createdAt": created_at_iso
            })

    ds_combined.sort(key=lambda x:x['relevance_score'], reverse=True)
    sp_combined.sort(key=lambda x:x['relevance_score'], reverse=True)
    top_ds = ds_combined[:10]
    top_sp = sp_combined[:10]

    # Summaries
    for item in top_ds:
        txt = f"{item['id']} has {item['likes']} likes and {item['downloads']} downloads."
        item["summary_50_words"] = summarize_with_deepseek_r1(txt, 50)

    for item in top_sp:
        txt = f"{item['id']} has {item['likes']} likes and {item.get('views','?')} views."
        item["summary_50_words"] = summarize_with_deepseek_r1(txt, 50)

    return top_ds, top_sp

def store_hf_datasets_in_db(items, endpoint="http://localhost:5001/api/huggingface-datasets"):
    payload = []
    for it in items:
        payload.append({
            "title": it["id"],
            "link":  f"https://huggingface.co/datasets/{it['id']}",
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": "HuggingFace user",
            "createdAt": it["createdAt"]
        })
    try:
        resp = requests.post(endpoint, json=payload)
        resp.raise_for_status()
        print("Inserted HF Datasets:", resp.json())
    except Exception as ex:
        print("Error posting HF Datasets:", ex)

def store_hf_spaces_in_db(items, endpoint="http://localhost:5001/api/huggingface-spaces"):
    payload = []
    for it in items:
        payload.append({
            "title": it["id"],
            "link":  f"https://huggingface.co/spaces/{it['id']}",
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": "HuggingFace user",
            "createdAt": it["createdAt"]
        })
    try:
        r = requests.post(endpoint, json=payload)
        r.raise_for_status()
        print("Inserted HF Spaces:", r.json())
    except Exception as exc:
        print("Error posting HF spaces:", exc)

if __name__=="__main__":
    ds, sp = get_top_datasets_and_spaces_all_keywords()

    if ds:
        store_hf_datasets_in_db(ds)
    else:
        print("No datasets found in the past 2 weeks.")

    if sp:
        store_hf_spaces_in_db(sp)
    else:
        print("No spaces found in the past 2 weeks.")

