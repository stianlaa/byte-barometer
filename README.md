# Byte Barometer

> Gauge the sentiment of HackerNews on any topic.

![Current UI of the Byte Barometer](/bytebarometer.gif?raw=true)
_From a subject chosen by the user a sentiment poll is done using natural language processing and aspect based sentiment analysis._

This project is intended to provide a useful tool for finding out what the general opinion of other developers is about a given subject. This is done using [hybrid semantic search](https://docs.pinecone.io/docs/hybrid-search) search and [aspect based sentiment analysis](https://github.com/yangheng95/PyABSA).

## Application structure

Like many web applications the Byte Barometer can be split into three layers, a [frontend](./frontend/README.md), [backend](./backend/README.md) and a [data storage](https://www.pinecone.io/). Details and instructions to run the various segments can be found within their respective directories.

## Caveats

This is one of my side projects, so there might be a bug or two hiding around. The code will be kept open source and hosting, storage and GPU specs will intentionally be kept quite small for sake of costs.

If you do happen to find it interesting and want to throw in a PR you are very welcome to do so!

## Path to production

The project is almost mature enough for first release, what remains is:

- [ ] Make pipeline to build and deploy application to paperspace
- [ ] Make pipeline publish most recent frontend to digital ocean
- [ ] Find way to dynamically get route to backend
- [ ] Make solution scale down to zero containers when unused for a while
- [ ] Test smallest available instance
- [ ] Investigate cost limitation
- [ ] Move to wss instead of ws to make application more secure

## Future work

- [ ] Improve sentence split by adjusting decoding to remove htmltags and other non-ascii character, Add use of https://pypi.org/project/semantic-text-splitter/ instead
- [ ] Update cuda in use to 12.2.2 on Dockerfile and host platform, perhaps hindered by nvidia driver
- [ ] Fix gpu serialized inferance warning, look into performance improvement
- [ ] Add endpoint where describe byte barometer
- [ ] Test lower gunicorn timeout, 30 is default, 300 is current
