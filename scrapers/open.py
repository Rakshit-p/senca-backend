import os
import re
import requests
import feedparser
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from bs4 import BeautifulSoup
from collections import Counter
import time

# ✅ Fix SSL Certificate Issue for NLTK
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

# ✅ Ensure necessary NLTK data is downloaded
nltk.download("punkt")
nltk.download("stopwords")
nltk.download("omw-1.4")
nltk.download("wordnet")
nltk.download("averaged_perceptron_tagger")
nltk.download("universal_tagset")
nltk.download("maxent_ne_chunker")
nltk.download("words")

# ✅ Fix for missing 'punkt_tab' error
try:
    nltk.data.find("tokenizers/punkt_tab/english")
except LookupError:
    nltk.download("punkt_tab")


# ------------------------------------------------------------------------------
# 1. STOPWORDS & BLACKLIST
# ------------------------------------------------------------------------------
EXCLUDE_WORDS = set(stopwords.words("english")).union({
    # Common filler words
    "using", "used", "approach", "method", "paper", "result",
    "model", "models", "learning", "study", "data", "research", "use",
    "new",
})

# Additional blacklisted terms (e.g., partial matches that produce noise)
BLACKLIST_TERMS = {
    # Non-AI terms or common false positives
    "airdrop", "mailing", "fair", "envision", "envisioned", "envisioning",
    "unfairness", "foundation-model-based", "foundations", "explainable",
    "fairness",
    # Add any other undesired tokens
}

# ------------------------------------------------------------------------------
# 2. AI FILTER RULES
# ------------------------------------------------------------------------------
# 2.1 Single-word tokens
AI_SINGLE_WORDS = {
    "ai", "ml", "gpt", "bert", "gan", "cnn", "rnn", "nn", "nlp",
    "llm", "chatgpt", "robot", "robotics", "embeddings", "lstm",
    # Add more single tokens if desired
    "pytorch", "tensorflow", "scikitlearn", "xgboost", "lightgbm", "huggingface"
}

# 2.2 Partial terms
# Removed "fairness", "explainable", "foundation" to avoid undesired hits
PARTIAL_TERMS = [
    "deeplearning",
    "transformer",
    "neural",
    "reinforcement",
    "autonom",        # catches 'autonomous', 'autonomy'
    "generative",
    "vision",
    "supervised",
    "unsupervised",
    "semisupervised",
    "semi-supervised",
    "self-supervised",
    "federated",
    "adversarial",
    "machinelearning",
    "computer-vision",
    "pytorch",
    "tensorflow",
    "scikitlearn",
    "xgboost",
    "lightgbm",
    "huggingface",
    # Add more partial terms as needed
]


def is_ai_related(word: str) -> bool:
    """
    Return True if 'word' is considered AI/ML-related, using:
    1) Blacklist check
    2) Exact AI_SINGLE_WORDS match
    3) Boundary checks for 'ai'/'ml'
    4) PARTIAL_TERMS match
    """
    w_lower = word.lower()

    # 1) Skip if blacklisted
    if w_lower in BLACKLIST_TERMS:
        return False

    # 2) Single-word match
    if w_lower in AI_SINGLE_WORDS:
        return True

    # 3) Boundary checks for 'ai' / 'ml'
    if re.search(r"\bai\b", w_lower):
        return True
    if re.search(r"\bml\b", w_lower):
        return True

    # 4) Partial terms
    for term in PARTIAL_TERMS:
        if term in w_lower:
            return True

    return False


# ------------------------------------------------------------------------------
# 3. SOURCE SCRAPING FUNCTIONS
# ------------------------------------------------------------------------------
def get_arxiv_keywords(query="artificial intelligence", max_results=1000):
    """
    Fetches papers from arXiv based on a query.
    Extracts frequent words/phrases from titles + abstracts.
    Returns a list of candidate keywords (AI-filtered).
    """
    print(f"[arXiv] Query='{query}', max_results={max_results}")
    base_url = "http://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Keyword-Scraper/1.0)"
    }

    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from arXiv: {e}")
        return []

    feed = feedparser.parse(response.text)
    text_corpus = []

    for entry in feed.entries:
        text_corpus.append(entry.title)
        text_corpus.append(entry.summary)

    # Clean up text
    joined_text = " ".join(text_corpus)
    soup = BeautifulSoup(joined_text, "html.parser")
    cleaned_text = re.sub(r"[^a-zA-Z0-9\s\-]", " ", soup.get_text())

    # Tokenize & filter
    tokens = word_tokenize(cleaned_text.lower())
    filtered = [
        t for t in tokens
        if t not in EXCLUDE_WORDS
           and len(t) > 2
           and len(t) < 25
    ]

    # Grab top words
    counts = Counter(filtered)
    top_words = [w for (w, _) in counts.most_common(3000)]

    ai_related = [w for w in top_words if is_ai_related(w)]
    print(f"  Found AI-related: {len(ai_related)} from query '{query}'")
    return ai_related


def get_devto_ai_tags():
    """
    Fetches AI-related tags from dev.to API.
    Returns a list of relevant AI/ML keywords.
    """
    print("[dev.to] Fetching AI-related tags...")
    url = "https://dev.to/api/tags"
    params = {"per_page": 1000}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching dev.to tags: {e}")
        return []

    relevant_tags = []
    for item in data:
        tag_name = item.get("name", "").strip().lower()
        if is_ai_related(tag_name):
            relevant_tags.append(tag_name)

    unique_tags = list(set(relevant_tags))
    print(f"  Found {len(unique_tags)} AI-related dev.to tags.")
    return unique_tags


def get_google_ai_blog_keywords(max_entries=50):
    """
    Fetches recent posts from the Google AI Blog (RSS feed).
    Extracts frequent words from the blog titles + summaries.
    Returns AI-related keywords.
    """
    print("[Google AI Blog] Fetching RSS feed...")
    feed_url = "https://ai.googleblog.com/feeds/posts/default?alt=rss"

    try:
        feed = feedparser.parse(feed_url)
    except Exception as e:
        print(f"Error fetching Google AI blog feed: {e}")
        return []

    text_corpus = []
    entries = feed.entries[:max_entries]  # limit to avoid too large a parse

    for entry in entries:
        if hasattr(entry, "title"):
            text_corpus.append(entry.title)
        if hasattr(entry, "summary"):
            text_corpus.append(entry.summary)

    # Clean up text
    joined_text = " ".join(text_corpus)
    soup = BeautifulSoup(joined_text, "html.parser")
    cleaned_text = re.sub(r"[^a-zA-Z0-9\s\-]", " ", soup.get_text())

    tokens = word_tokenize(cleaned_text.lower())
    filtered = [
        t for t in tokens
        if t not in EXCLUDE_WORDS
           and len(t) > 2
           and len(t) < 25
    ]

    counts = Counter(filtered)
    top_words = [w for (w, _) in counts.most_common(1000)]

    ai_related = [w for w in top_words if is_ai_related(w)]
    print(f"  Found {len(ai_related)} AI-related from Google AI Blog.")
    return ai_related


def get_openai_blog_keywords(max_entries=30):
    """
    Fetches recent posts from the OpenAI Blog (if the RSS feed is available).
    Extract frequent words from titles + summaries.
    Returns AI-related keywords.
    """
    # The standard openai blog feed might be:
    # https://openai.com/blog/rss
    # If that doesn't work, you can skip or replace with another reliable source.
    print("[OpenAI Blog] Fetching RSS feed...")
    feed_url = "https://openai.com/blog/rss"

    try:
        feed = feedparser.parse(feed_url)
    except Exception as e:
        print(f"Error fetching OpenAI blog feed: {e}")
        return []

    text_corpus = []
    entries = feed.entries[:max_entries]

    for entry in entries:
        if hasattr(entry, "title"):
            text_corpus.append(entry.title)
        if hasattr(entry, "summary"):
            text_corpus.append(entry.summary)

    joined_text = " ".join(text_corpus)
    soup = BeautifulSoup(joined_text, "html.parser")
    cleaned_text = re.sub(r"[^a-zA-Z0-9\s\-]", " ", soup.get_text())

    tokens = word_tokenize(cleaned_text.lower())
    filtered = [
        t for t in tokens
        if t not in EXCLUDE_WORDS
           and len(t) > 2
           and len(t) < 25
    ]

    counts = Counter(filtered)
    top_words = [w for (w, _) in counts.most_common(1000)]

    ai_related = [w for w in top_words if is_ai_related(w)]
    print(f"  Found {len(ai_related)} AI-related from OpenAI Blog.")
    return ai_related


# ------------------------------------------------------------------------------
# 4. MAIN COMBINER
# ------------------------------------------------------------------------------
def combine_keywords(min_count=300, out_file="ai_keywords.txt"):
    """
    Scrapes AI/ML keywords from multiple sources:
        - dev.to (AI tags)
        - arXiv (multiple queries)
        - Google AI Blog
        - OpenAI Blog
    Then deduplicates them, filters out junk, and writes to file.
    Aims for at least 'min_count' final keywords.
    """
    print("Starting keyword extraction process...\n")

    # 1) dev.to
    devto_tags = get_devto_ai_tags()

    # 2) arXiv
    #    Increase queries & max_results for more coverage
    arxiv_queries = [
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "computer vision",
        "natural language processing",
        "transformers",
        "generative AI",
        "robotics",
        "autonomous systems",
        "data science",
        "federated learning",
        "adversarial",
        "supervised learning",
        "unsupervised learning",
        "semi-supervised learning",
        "self-supervised learning",
        "bayesian networks",
        "automl",
        "language models",
        "prompt engineering",
        "foundation models",
        "large language models",
        "transfer learning",
        "reinforcement learning",
        # Add more if needed
    ]

    all_keywords = set()

    # Add dev.to tags
    all_keywords.update(devto_tags)

    # Scrape arXiv for each query
    for q in arxiv_queries:
        # Bump max_results for more coverage
        arxiv_words = get_arxiv_keywords(query=q, max_results=800)
        all_keywords.update(arxiv_words)
        # Sleep to avoid rate-limiting
        time.sleep(2)

    # 3) Google AI Blog
    google_ai_words = get_google_ai_blog_keywords(max_entries=50)
    all_keywords.update(google_ai_words)

    # 4) OpenAI Blog
    openai_words = get_openai_blog_keywords(max_entries=30)
    all_keywords.update(openai_words)

    # ----------------------------------------------------------------------------
    # Preliminary list
    # ----------------------------------------------------------------------------
    print(f"\nCollected {len(all_keywords)} raw keywords before final cleaning...\n")

    final = []
    for kw in all_keywords:
        # 1. Remove numeric-only or <3 length
        if len(kw) < 3 or kw.isdigit():
            continue

        # 2. ASCII check (avoid random foreign text)
        if not all(ord(c) < 128 for c in kw):
            continue

        # 3. Allowed characters: letters, digits, hyphens only
        if not re.match(r"^[a-zA-Z0-9\-]+$", kw):
            continue

        # 4. Final check: is AI-related
        if is_ai_related(kw):
            final.append(kw)

    # Remove duplicates & sort
    final_sorted = sorted(set(final))
    count_final = len(final_sorted)
    print(f"Final number of keywords: {count_final}")

    # If below min_count, show a warning
    if count_final < min_count:
        print(f"WARNING: Only {count_final} keywords found, below desired minimum of {min_count}.")

    # Write to file
    with open(out_file, "w", encoding="utf-8") as f:
        for keyword in final_sorted:
            f.write(keyword + "\n")

    print(f"\n✅ Keywords saved to '{out_file}'!")
    print("Done.")


# ------------------------------------------------------------------------------
# 5. RUN
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    # We aim for at least 300, but you can raise or lower min_count
    combine_keywords(min_count=300, out_file="ai3_keywords.txt")