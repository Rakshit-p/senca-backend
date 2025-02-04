#CLIENT_ID = "c56e16d88b88479e9c8d997efbcc7de6"
#CLIENT_SECRET = "ee67879c42af4cb286eb30ada47fc4b4"

import requests
import base64
import os
import datetime
import subprocess

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

CLIENT_ID="c56e16d88b88479e9c8d997efbcc7de6"
CLIENT_SECRET="ee67879c42af4cb286eb30ada47fc4b4"

def load_all_spotify_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["Artificial Intelligence"]
    lines=[]
    with open(filepath,'r',encoding='utf-8') as f:
        for line in f:
            kw=line.strip().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["Artificial Intelligence"]
    return lines

def get_spotify_token():
    url="https://accounts.spotify.com/api/token"
    headers={
        "Authorization":"Basic "+base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    }
    data={"grant_type":"client_credentials"}
    resp=requests.post(url,headers=headers,data=data)
    if resp.status_code==200:
        return resp.json()["access_token"]
    else:
        raise Exception("Failed to get Spotify token:"+resp.text)

def calculate_podcast_relevance(show_obj,keyword):
    base_score=show_obj.get("popularity",50)
    name_lower=show_obj.get("name","").lower()
    desc_lower=show_obj.get("description","").lower()
    extra=0
    if keyword.lower() in name_lower:
        extra+=10
    if keyword.lower() in desc_lower:
        extra+=5
    return base_score+extra

def fetch_spotify_podcasts_for_keyword(token, keyword, limit=5):
    url="https://api.spotify.com/v1/search"
    headers={"Authorization":f"Bearer {token}"}
    params={
        "q":keyword,
        "type":"show",
        "limit":limit
    }
    r=requests.get(url, headers=headers, params=params)
    if r.status_code==200:
        return r.json().get('shows',{}).get('items',[])
    else:
        print("Error fetching Spotify:",r.status_code,r.text)
        return []

def get_ai_podcasts_all_keywords():
    token=get_spotify_token()
    keywords=load_all_spotify_keywords()
    combined=[]
    for kw in keywords:
        items=fetch_spotify_podcasts_for_keyword(token, kw, limit=5)
        for show in items:
            score=calculate_podcast_relevance(show, kw)
            created_at_iso = datetime.datetime.now().isoformat()

            combined.append({
                "keyword": kw,
                "name": show.get("name",""),
                "description": show.get("description",""),
                "publisher": show.get("publisher",""),
                "link": show.get("external_urls",{}).get("spotify",""),
                "popularity": show.get("popularity",0),
                "relevance_score": score,
                "image": "No image",
                "createdAt": created_at_iso
            })

    combined.sort(key=lambda x:x['relevance_score'],reverse=True)
    top_10=combined[:10]
    for item in top_10:
        to_sum = f"{item['name']} by {item['publisher']}. {item['description']}"
        item["summary_50_words"]=summarize_with_deepseek_r1(to_sum,50)

    return top_10

def store_spotify_in_db(items, endpoint="http://localhost:5001/api/spotify1-resources"):
    if not items:
        print("No items to store in database")
        return
        
    payload = []
    for it in items:
        payload.append({
            "title": it["name"],
            "link":  it["link"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": it["publisher"],
            "createdAt": it["createdAt"]
        })
    try:
        # First check if the server is running
        base_url = endpoint.rsplit('/', 1)[0]
        requests.get(base_url)
        
        resp = requests.post(endpoint, json=payload)
        resp.raise_for_status()
        print(f"Successfully inserted {len(payload)} Spotify podcasts")
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to server at {endpoint}")
        print("Please ensure your backend server is running on port 5001")
    except requests.exceptions.HTTPError as ex:
        print(f"HTTP Error: {ex}")
        print("Please check if the API endpoint path is correct")
    except Exception as ex:
        print(f"Error inserting Spotify data: {ex}")

if __name__ == "__main__":
    try:
        podcasts = get_ai_podcasts_all_keywords()
        if podcasts:
            # Updated default endpoint
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:5001/api/spotify1-resources')
            store_spotify_in_db(podcasts, backend_url)
        else:
            print("No podcasts found.")
    except Exception as e:
        print(f"Error: {e}")