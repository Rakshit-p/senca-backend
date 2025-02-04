import tweepy
import os
import datetime
import requests

api_key = '6lv7G2k3ZIxc1HGjxd8mhdsSu'
api_secret = 'ekNtYFD1izcNwS5SGhoNOvqEmpGMuxCmJUKkyqARRPna2gEDAB'
access_token = '1870288605115002880-BgDljwU9FenljAEEwbYxYK8bj9MRlE'
access_token_secret = 'AGQtUFoqPCNxnZjUzL0jw4JDgvRNbSSPwbegtMuKaY32m'
bearer_token = 'AAAAAAAAAAAAAAAAAAAAABW5xgEAAAAAz5fLFjV5gevUS0mI4cOX5xMntyM%3Dnj6A2jr9JYs3ohIK36CgKo2UAUFPRch1klqItsUjWTtGq8fDFi'


try:
    client = tweepy.Client(
        bearer_token=bearer_token,
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_token_secret
    )
    user = client.get_me()
    print(f"✅ Auth success! Logged in as: {user.data['username']}")
except Exception as e:
    print("❌ Twitter auth failed:", e)
    exit()

def calculate_relevance_tweet(likes, retweets, replies, impressions):
    return 0.4*likes + 0.3*retweets + 0.2*replies + 0.1*impressions

def load_all_twitter_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["AI","Artificial Intelligence"]
    lines=[]
    with open(filepath,'r',encoding='utf-8') as f:
        for line in f:
            kw=line.strip().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["AI"]
    return lines

def fetch_tweets_for_keyword(keyword, max_results=10, start_time=None):
    query_str=f"({keyword}) lang:en"
    if len(query_str)>500:
        query_str=query_str[:500]+" ) lang:en"
    try:
        tweets = client.search_recent_tweets(
            query=query_str,
            max_results=max_results,
            tweet_fields=['author_id','created_at','public_metrics'],
            sort_order='recency',
            start_time=start_time
        )
        return tweets.data if tweets.data else []
    except Exception as ex:
        print(f"Error fetching tweets for '{keyword}':", ex)
        return []

def get_top_ai_tweets_all_keywords():
    day_3_ago=datetime.datetime.utcnow()-datetime.timedelta(days=3)
    start_time_str=day_3_ago.isoformat("T")+"Z"

    keywords=load_all_twitter_keywords()
    combined=[]
    for kw in keywords:
        tweets_data=fetch_tweets_for_keyword(kw,10,start_time_str)
        for tw in tweets_data:
            metrics=tw.public_metrics
            score=calculate_relevance_tweet(
                metrics.get('like_count',0),
                metrics.get('retweet_count',0),
                metrics.get('reply_count',0),
                metrics.get('impression_count',0)
            )

            created_at_iso = datetime.datetime.now().isoformat()

            combined.append({
                "keyword": kw,
                "id": tw.id,
                "text": tw.text,
                "author_id": tw.author_id,
                "created_at": tw.created_at,
                "likes": metrics.get('like_count',0),
                "retweets": metrics.get('retweet_count',0),
                "replies": metrics.get('reply_count',0),
                "views": metrics.get('impression_count',0),
                "relevance_score": score,
                "image": "No image",
                "createdAt": created_at_iso
            })
    combined.sort(key=lambda x:x['relevance_score'],reverse=True)
    return combined[:10]

def store_tweets_in_db(items, endpoint="http://localhost:5001/api/tweet-resources"):
    payload=[]
    for it in items:
        tweet_link = f"https://twitter.com/i/web/status/{it['id']}"
        payload.append({
            "title": it["text"][:80]+"..." if it["text"] else "No Title",
            "link":  tweet_link,
            "image": it["image"],
            "summary": "",
            "resourceBy": f"AuthorID:{it['author_id']}",
            "createdAt": it["createdAt"]
        })
    try:
        r=requests.post(endpoint, json=payload)
        r.raise_for_status()
        print("Inserted tweets:", r.json())
    except Exception as ex:
        print("Error inserting tweets:", ex)

if __name__=="__main__":
    top_tweets=get_top_ai_tweets_all_keywords()
    if top_tweets:
        store_tweets_in_db(top_tweets)
    else:
        print("No tweets found in the past 3 days.")