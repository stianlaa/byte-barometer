# byte-barometer

Poll HackerNews for sentiment on a specific subject.

![Current frontend of the byte barometer](/bytebarometer.gif?raw=true "From an arbitrary subject chosen by the user a general poll is created using natural language processing.")

## Application structure

This project runs a semantic search for a subject from the user, then runs aspect based sentiment analysis on the most relevant comments and finally displays this information in a "byte-barometer".

The backend application offers a websocket endpoint for clients to connect, and upon receiveing requests steadily emits processing results. The backend is wrapped in a docker container for ease of development and deployment.

The frontend application is a relatively slim React application that connects to this endpoint and displays the results.

The third is the document-fetcher, this creates embeddings from recent comments on HackerNews and stores these in a vector database. This should run regularly and also discard old entries due to space and processing constraints.

## Path to production

- [ ] Add types to received responses
- [ ] Organize implementation, extract utility properly etc
- [ ] In document fetcher util, use annotation instead
- [ ] Create variant that writes to file instead of upsert
- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii characters
- [ ] Improve documentfetcher so that it may be run continiously from whatever is the current starting point
- [ ] Investigate if there are better alternatives, e.g somewhere to just deploy the docker file, and give it access to a GPU
- [ ] Replace werkzeug
- [ ] Add validation on requests
- [ ] Add caveats about the information
  - Most recent X entries, where x is part of a story or comment under frontpage
  - The aspect based sentiment analysis asks "what does this comment think about "querystring"", and might be confused by longer queries
  - This is a side project, so there are likely bugs and shortcomings everywhere

## Future work

- [ ] Add expand button to comments, to show full comment, where it needs to get fetched as well
- [ ] Update cuda in use to 12.2.2 on Dockerfile and host platform, perhaps hindered by nvidia driver
- [ ] Fix gpu serialized inferance warning, look into performance improvement
- [ ] Fix sentiments.py numpy issue
