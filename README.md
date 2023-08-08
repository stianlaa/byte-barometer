# byte-barometer

Poll HackerNews for sentiment on a specific subject.

## Application structure

This project runs a semantic search for a subject and runs aspect based sentiment analysis on the most relevant comments, then displays this information in a "byte-barometer".

## Future work

- [ ] Do sentiment analysis before upserting?
- [ ] Consider doing a general sentiment analysis per document being sent in, instead of aspect based analysis.
- [ ] Add an animation to the byte-barometer, when it receives new data.
- [ ] Add a sort of streaming of comments and sentiment analysis, so that the byte-barometer is updated in real time.
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

## pallette:

# https://coolors.co/c9c4b2-ddd8c4-c0d1b6-a3c9a8-84b59f-69a297-749189-6b6b6b-945d5d-50808e
