import feedparser
import os

def load_all_podcast_keywords(filepath='ai4_keywords.txt'):
    if not os.path.exists(filepath):
        return ["AI", "Artificial Intelligence"]
    lines = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            kw = line.strip().strip('",')
            if kw:
                lines.append(kw)
    if not lines:
        return ["AI", "Artificial Intelligence"]
    return lines

def get_ai_podcasts_all_keywords():
    rss_feed_url = "https://feeds.megaphone.fm/AI-podcast"
    print(f"Fetching RSS feed from: {rss_feed_url}")
    feed = feedparser.parse(rss_feed_url)
    print("Feed parsed successfully")

    if not feed.entries:
        print("No entries found in the RSS feed.")
        return []

    keywords = load_all_podcast_keywords()
    combined = []

    # We'll do the following approach:
    # For each entry, for each keyword => if keyword in title/desc => +some score
    # Then combine the highest matches.
    for entry in feed.entries:
        title = entry.title
        desc = getattr(entry, "description", "")
        text_lower = (title + " " + desc).lower()
        best_score = 0
        best_keyword = None
        for kw in keywords:
            kw_lower = kw.lower()
            # e.g. +1 if found
            if kw_lower in text_lower:
                # If you want to do a more complex approach (multiple matches?), do so
                # For simplicity, each keyword match => +1
                # We'll keep track of the "best" single keyword for that entry
                # or sum them up. Let's do sum:
                best_score += 1
                best_keyword = kw
        if best_score > 0:
            combined.append({
                "title": entry.title,
                "link": entry.link,
                "published": entry.get('published', 'No date available'),
                "keyword_match": best_keyword,
                "relevance_score": best_score
            })

    combined.sort(key=lambda x: x['relevance_score'], reverse=True)
    return combined[:10]

if __name__ == "__main__":
    results = get_ai_podcasts_all_keywords()
    if results:
        for idx, r in enumerate(results, start=1):
            print(f"{idx}. Title: {r['title']}")
            print(f"   Link: {r['link']}")
            print(f"   Published: {r['published']}")
            print(f"   Matched Keyword: {r['keyword_match']}")
            print(f"   Relevance Score: {r['relevance_score']}")
            print("-"*50)
    else:
        print("No podcasts found.")