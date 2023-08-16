# byte-barometer

Poll HackerNews for sentiment on a specific subject.

![Current frontend of the byte barometer](/bytebarometer.png?raw=true "From an arbitrary subject chosen by the user a general poll is created using natural language processing.")

## Application structure

This project runs a semantic search for a subject and runs aspect based sentiment analysis on the most relevant comments, then displays this information in a "byte-barometer".

## Future work

- [x] Investigate current responsetimes
      Time taken to create dense embeddings: 0.3159 seconds
      Time taken to create sparse embeddings: 0.0179 seconds
      Time taken to query index: 0.4001 seconds
      Time taken to infer sentiment: 14.4596 seconds for 30 documents

- [ ] Add an animation to the byte-barometer, when it receives new data.
- [ ] Improve responsiveness, current pipeline, but speed up aspect based sentiment analyis and add streaming

- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii characters, but keep original available too.
- [ ] Populate an index with a larger amount of data
- [ ] Change commentdisplay to show the comments as cards
- [ ] Improve comment sentiment display, by badge or similar
- [ ] Improve comment styling
- [ ] Investigate adding default set of results, of which one random result is shown immediately
- [ ] Investigate performance improvement from Splade alternatives, or GPU use
- [ ] Investigate if only relevant comments can be shown, and if so, how to do this, e.g filter by abs of comment match
- [ ] Display how many comments are being analyzed
- [ ] Add icons for the various links, story, comments, author etc
- [ ] Add expand button to comments, to show full comment, where it needs to get fetched as well
