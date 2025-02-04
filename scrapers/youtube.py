#sk-a183cc5e3b8d4c9fae49acfd4c890c9f 
#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 
#AIzaSyCyGCHx0Z0uQY6FW_tpO_UPPsXfMoD7UnA


import requests
import os
import datetime
import subprocess
import time
from googleapiclient.discovery import build
from datetime import timedelta
from ratelimit import limits, sleep_and_retry

MODEL_NAME="deepseek-r1:1.5b"

# Define rate limits (YouTube API has a daily quota)
CALLS_PER_MINUTE = 20  # Adjust based on your quota
ONE_MINUTE = 60

@sleep_and_retry
@limits(calls=CALLS_PER_MINUTE, period=ONE_MINUTE)
def make_youtube_request(request):
    try:
        return request.execute()
    except Exception as e:
        if "quotaExceeded" in str(e):
            print("YouTube API quota exceeded. Waiting before retry...")
            time.sleep(60)  # Wait a minute before retry
            return None
        raise e

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

def load_youtube_keywords(filepath='ai6_keywords.txt'):
    if not os.path.exists(filepath):
        return ["artificial intelligence news"]
    lines = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            # Convert to lowercase while loading
            kw = line.strip().strip('",').lower()
            if kw:
                lines.append(kw)
    if not lines:
        return ["artificial intelligence news"]
    return lines

def calculate_youtube_relevance(views, likes, comments, favorites, subscriber_count):
    v = float(views) if views else 0
    l = float(likes) if likes else 0
    c = float(comments) if comments else 0
    s = float(subscriber_count) if subscriber_count else 0
    
    # Stronger normalization
    v_normalized = min(v / 1000000, 1.0)  # Cap at 1M views
    l_normalized = min(l / 50000, 1.0)    # Cap at 50K likes
    s_normalized = min(s / 1000000, 1.0)  # Cap at 1M subscribers
    
    # Calculate engagement rate with minimum view threshold
    engagement = (l/v) if v >= 100000 else 0
    e_normalized = min(engagement * 100, 1.0)
    
    # Weighted formula prioritizing views
    return (0.5 * v_normalized) + (0.25 * e_normalized) + (0.15 * l_normalized) + (0.1 * s_normalized)

def fetch_youtube_for_keyword(keyword, api_key, max_results=5):
    published_after = (datetime.datetime.utcnow() - datetime.timedelta(days=5)).isoformat("T") + "Z"
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    # Modified search to favor educational content
    search_req = youtube.search().list(
        q=f"{keyword} (lecture OR course OR tutorial OR explanation OR guide)",
        part="snippet",
        type="video",
        videoDuration="long",
        maxResults=50,
        order="relevance",  # Changed to relevance for better educational content
        publishedAfter=published_after,
        relevanceLanguage="en",
        regionCode="US",
        safeSearch="strict"
    )
    
    try:
        search_resp = search_req.execute()
        video_ids = [item['id']['videoId'] for item in search_resp.get('items', [])]
        
        if not video_ids:
            return []
            
        stats_req = youtube.videos().list(
            part="statistics,snippet",
            id=",".join(video_ids)
        )
        stats_resp = stats_req.execute()
        
        results = []
        for video in stats_resp.get('items', []):
            try:
                view_count = int(video['statistics'].get('viewCount', 0))
                
                # Lowered view count threshold to 50k
                if view_count < 50000:
                    continue
                    
                title = video['snippet'].get('title', '').lower()
                description = video['snippet'].get('description', '').lower()
                
                # Stricter language check
                title_orig = video['snippet'].get('title', '')
                description_orig = video['snippet'].get('description', '')
                
                # Skip if title or description contains non-ASCII characters
                if (not all(ord(c) < 128 for c in title_orig) or 
                    not all(ord(c) < 128 for c in description_orig[:100])):  # Check first 100 chars of description
                    continue
                
                # Check if the video's default language is English
                if video['snippet'].get('defaultLanguage', 'en') != 'en':
                    continue
                
                # New: Preferred keywords that indicate academic/educational content
                
                

                # Expanded skip keywords to better filter news and sensational content
                skip_keywords = [
                    # News/Headlines related
                    'breaking news', 'headlines', 'news update', 'latest news',
                    'breaking', 'exclusive', 'alert', 'live update',
                    
                    # Sensational terms
                    'shocking', 'incredible', 'amazing', 'you won\'t believe',
                    'mind blowing', 'revolutionary', 'disrupting', 'game changer',
                    
                    # Political/Controversial
                    'china vs', 'us vs', 'war', 'conflict', 'crisis',
                    'controversy', 'scandal', 'leaked', 'exposed',
                    'warning', 'emergency', 'threat', 'dangerous',
                    
                    # Market/Financial
                    'stock market', 'stocks', 'market crash', 'financial crisis',
                    'investment', 'crypto', 'bitcoin', 'price prediction',
                    
                    # Clickbait
                    'must watch', 'share this', 'gone wrong', 'exposed',
                    'secret', 'hack', 'trick', 'clickbait', 'viral'
                ]

                # Skip if title contains news outlet names
                news_outlets = [
                    'cnn', 'fox', 'bbc', 'reuters', 'bloomberg', 'cnbc',
                    'news', 'daily', 'headlines', 'report', 'geo news'
                ]
                
                if any(outlet in title.lower() for outlet in news_outlets):
                    continue

                # Skip if title has typical news patterns
                if any(title.lower().startswith(p) for p in ['why ', 'how ', 'what if', 'when ']):
                    if title.count('?') > 0:  # News headlines often use question format
                        continue

                # Check both title and description for skip keywords
                if any(kw in title or kw in description for kw in skip_keywords):
                    continue
                
                # Skip clickbait formatting
                if (title.isupper() or 
                    title.count('!') > 1 or 
                    title.count('?') > 1 or
                    title.count('🔥') > 0 or  # Skip emoji-heavy titles
                    title.count('😱') > 0 or
                    title.count('💥') > 0):
                    continue

                channel_id = video['snippet']['channelId']
                
                # Get channel statistics
                channel_req = youtube.channels().list(
                    part="statistics",
                    id=channel_id
                )
                channel_resp = channel_req.execute()
                
                if not channel_resp.get('items'):
                    continue
                    
                subscriber_count = int(channel_resp['items'][0]['statistics'].get('subscriberCount', 0))
                
                # Skip channels with less than 50k subscribers
                if subscriber_count < 50000:
                    continue
                
                like_count = int(video['statistics'].get('likeCount', 0))
                comment_count = int(video['statistics'].get('commentCount', 0))
                
                relevance_score = calculate_youtube_relevance(
                    view_count,
                    like_count,
                    comment_count,
                    0,
                    subscriber_count
                )
                
                results.append({
                    'videoId': video['id'],
                    'title': video['snippet'].get('title', ''),
                    'url': f"https://www.youtube.com/watch?v={video['id']}",
                    'channel': video['snippet'].get('channelTitle', ''),
                    'channelId': channel_id,
                    'image': video['snippet'].get('thumbnails', {}).get('high', {}).get('url', ''),
                    'createdAt': datetime.datetime.now().isoformat(),
                    'view_count': view_count,
                    'relevance_score': relevance_score
                })
                
            except Exception as e:
                print(f"Error processing video {video.get('id')}: {e}")
                continue
        
        # Sort by relevance score and return top results
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:max_results]
        
    except Exception as e:
        print(f"Error in fetch_youtube_for_keyword: {e}")
        return []

def get_top_ai_videos_all_keywords(api_key):
    keywords = load_youtube_keywords()
    combined = []
    seen_videos = set()  # Track seen video IDs
    
    for kw in keywords:
        try:
            print(f"Fetching videos for keyword: {kw}")
            data = fetch_youtube_for_keyword(kw, api_key, 5)
            if data:
                # Only add videos we haven't seen before
                for video in data:
                    if video['videoId'] not in seen_videos:
                        combined.append(video)
                        seen_videos.add(video['videoId'])
            time.sleep(2)
        except Exception as e:
            print(f"Error processing keyword {kw}: {e}")
            continue
    
    combined.sort(key=lambda x: x['relevance_score'], reverse=True)
    top_10 = combined[:10]
    
    # Rate limit summaries
    for item in top_10:
        try:
            summ_text = f"{item['title']} from channel {item['channel']}"
            item["summary_50_words"] = summarize_with_deepseek_r1(summ_text, 50)
            time.sleep(1)  # Add delay between summaries
        except Exception as e:
            print(f"Error generating summary: {e}")
            item["summary_50_words"] = item['title']
    
    return top_10

def store_youtube_in_db(items, endpoint="http://localhost:5001/api/youtube-resources"):
    payload=[]
    for it in items:
        payload.append({
            "title": it["title"],
            "link":  it["url"],
            "image": it["image"],
            "summary": it["summary_50_words"],
            "resourceBy": it["channel"],
            "createdAt": it["createdAt"]
        })
    try:
        r=requests.post(endpoint, json=payload)
        r.raise_for_status()
        print("Inserted YouTube data:", r.json())
    except Exception as ex:
        print("Error inserting YouTube data:",ex)

if __name__=="__main__":
    YT_API_KEY="AIzaSyCyGCHx0Z0uQY6FW_tpO_UPPsXfMoD7UnA"
    final_videos=get_top_ai_videos_all_keywords(YT_API_KEY)
    if final_videos:
        store_youtube_in_db(final_videos)
    else:
        print("No new videos found in the past 3 days.")