import requests
import base64

# Spotify API credentials
CLIENT_ID = 'c56e16d88b88479e9c8d997efbcc7de6'
CLIENT_SECRET = 'c56e16d88b88479e9c8d997efbcc7de6'

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    }
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception("Failed to get access token: " + response.text)

def get_ai_podcasts():
    ACCESS_TOKEN = get_spotify_token()
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}"
    }
    params = {
        "q": "Artificial Intelligence",
        "type": "show",
        "limit": 10
    }
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        podcasts = []
        for show in response.json()['shows']['items']:
            podcasts.append({
                "name": show["name"],
                "description": show["description"],
                "publisher": show["publisher"],
                "link": show["external_urls"]["spotify"]
            })
        return podcasts
    else:
        raise Exception("Failed to fetch podcasts: " + response.text)

# Fetch and display podcasts
if __name__ == "__main__":
    podcasts = get_ai_podcasts()
    for podcast in podcasts:
        print(f"Name: {podcast['name']}")
        print(f"Description: {podcast['description']}")
        print(f"Publisher: {podcast['publisher']}")
        print(f"Link: {podcast['link']}")
        print("-" * 50)