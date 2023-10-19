# byte-barometer

Poll HackerNews for sentiment on a specific subject.

![Current frontend of the byte barometer](/bytebarometer.png?raw=true "From an arbitrary subject chosen by the user a general poll is created using natural language processing.")

## Application structure

This project runs a semantic search for a subject and runs aspect based sentiment analysis on the most relevant comments, then displays this information in a "byte-barometer".

## Future work

- [ ] Dependencylist, perhaps docker
- [ ] Update readmes
- [ ] Test delete and manual query
- [ ] Update portfolio

- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii characters
- [ ] Improve comment sentiment display, by badge or similar
- [ ] Improve comment styling
- [ ] Investigate if only relevant comments can be shown, and if so, how to do this, e.g filter by abs of comment match
- [ ] Display how many comments are being analyzed
- [ ] Add icons for the various links, story, comments, author etc
- [ ] Add expand button to comments, to show full comment, where it needs to get fetched as well
- [ ] gpu serialized inferance warning, look into performance improvement
