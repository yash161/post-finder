from tinyfish import TinyFish

client = TinyFish()

response = client.search.query(
  "latest FIFA World Cup news today",
  location = "US",
  language = "en",
)

for result in response.results:
  print(result.title, result.url)