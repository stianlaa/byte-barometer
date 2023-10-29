# Byte-Barometer Frontend

The frontend of the Byte Barometer is a conventional React.js application. It should provide an intuitive and responsive user interface through which users can query about the sentiment that HackerNews has on a subject they are interested in.

# Quick summary

The application will when a user queries something send the request over websocket, and subsequently listen for any published responses. This is in order to make the sometimes lengthy processing time less troublesome to users.

As results are received a live summary of the results should be presented, with more details available below. Byte Barometer should allow users to navgiate to the underlying comment in hackernews if they want to verify or inspect the source.

# Getting started

For development with hot reloading of components use `npm run serve` to start the development server.
