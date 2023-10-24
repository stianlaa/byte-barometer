# byte-barometer

Poll HackerNews for sentiment on a specific subject.

![Current frontend of the byte barometer](/bytebarometer.gif?raw=true "From an arbitrary subject chosen by the user a general poll is created using natural language processing.")

## Application structure

This project runs a semantic search for a subject and runs aspect based sentiment analysis on the most relevant comments, then displays this information in a "byte-barometer".

## Future work

- [ ] Replace werkzeug
- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii characters

- [ ] Improve documentfetcher so that it may be run continiously from whatever is the current starting point
- [ ] Add expand button to comments, to show full comment, where it needs to get fetched as well
- [ ] Update cuda in use to 12.2.2 on Dockerfile and host platform, perhaps hindered by nvidia driver
- [ ] Fix gpu serialized inferance warning, look into performance improvement
- [ ] Fix sentiments.py numpy issue
