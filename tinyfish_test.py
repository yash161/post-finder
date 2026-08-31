import json, os, urllib.parse, urllib.request

# Load API key from .env
with open(".env") as f:
    for line in f:
        if line.startswith("TINYFISH_API_KEY="):
            api_key = line.split("=", 1)[1].strip()

query = 'go to https://www.linkedin.com/jobs and apply past 24 hours filets and then type ai engineer and tell me what are u geeting '
url = "https://api.search.tinyfish.ai?" + urllib.parse.urlencode({"query": query, "location": "US", "language": "en"})

req = urllib.request.Request(url, headers={
    "X-API-Key": api_key,
    "X-TF-Request-Origin": "api",
    "X-TF-Client-Name": "post-finder",
})

with urllib.request.urlopen(req) as res:
    print(json.dumps(json.loads(res.read()), indent=2))