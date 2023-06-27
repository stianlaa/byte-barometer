# backend byte-barometer

Offers an api for searching hackernews for a subject, and calculating the sentiment for the given subject.

## Usage

```bash
# For running the server, exposing the api
npm run dev";
```

```bash
# For running a single query with the given parameters
npm run dev -- -commentCount 5 -query "react.js"
```

## Convenience:

For testing the endpoint

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query":"React.js", "commentCount":5}' http://localhost:3000/query
```
