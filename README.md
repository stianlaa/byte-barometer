# byte-barometer

Poll HackerNews for sentiment on a specific subject.

![Current frontend of the byte barometer](/bytebarometer.png?raw=true "From an arbitrary subject chosen by the user a general poll is created using natural language processing.")

## Application structure

This project runs a semantic search for a subject and runs aspect based sentiment analysis on the most relevant comments, then displays this information in a "byte-barometer".

## Future work

- [ ] Replace werkzeug
- [ ] Test delete
- [ ] Test populate index
- [ ] Test query index
- [ ] Enable gpu use for sentiment analysis
- [ ] Update portfolio with gif of results

- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii characters
- [ ] Improve comment sentiment display, by badge or similar
- [ ] Improve comment styling
- [ ] Add relevancy filter
- [ ] Add icons for the various links, story, comments, author etc
- [ ] Add expand button to comments, to show full comment, where it needs to get fetched as well
- [ ] Fix gpu serialized inferance warning, look into performance improvement
- [ ] Fix sentiments.py numpy issue
