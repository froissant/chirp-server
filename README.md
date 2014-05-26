# Chirp Server

Twitter Streaming Server

## Installing

To run the code in this repository, you will need Node, [Twit](https://github.com/ttezel/twit), [Socket.IO](http://socket.io/) and Twitter credentials. To obtain the Twitter credentials, go to [Twitter Developers Site](https://dev.twitter.com/), create an application and create access tokens for your application. You will need the consumer key, consumer secret, access token and access token secret and replace the values in the file `credentials.json`.

The dependencies on this project can be installed from the command line by typing:

    npm install

## Examples

- [1. Twitter Sample](01-twitter-sample.js)
- [2. Twitter Filtering](02-twitter-filter.js)
- [3. Twitter Counting](03-twitter-counting.js)