// Chirp Server
// ------------

// Import the Node modules
var Twit     = require('twit'),         // Twitter API Client
    IOServer = require('socket.io'),    // Client-side communication
    config   = require('./config.js');  // Twitter Credentials

// Configure the Twit object with the application credentials
var T = new Twit(config);

// Create a new instance of the Socket.IO Server
var io = new IOServer(9720);

// List of topics to listen.
var topics = [
    {word: 'morning', client: 'server'}
];

function words() {
    return topics.map(function(d) { return d.word; });
}

// Initializes the twitter filter stream, tracking the words in the
// topic list.
var stream = T.stream('statuses/filter', {track: words()});

function emitTweet(tweet) {

    // Process only geotagged tweets.
    if (tweet.coordinates) {

        // Check if any of the topics is mentioned on the tweet
        topics.forEach(function(topic) {

            // Check if the topic is contained in the tweet text
            if (tweet.text.toLowerCase().indexOf(topic.word) > 0) {

                var clientSocket = io.of('/').connected[topic.client];

                if (clientSocket) {
                    clientSocket.volatile.emit('tweet', {
                        word: topic.word,
                        coordinates: tweet.coordinates,
                        id: tweet.id
                    });
                }

            }

        });
    }
}

stream.on('tweet', emitTweet);

io.on('connection', function(socket) {

    console.log('client', socket.id, 'connected.');

    socket.on('add', function(topic) {

        // Adds a new topic to the list.
        topics.push({word: topic.word, client: socket.id});

        // Resets the Twitter stream
        stream.stop();
        stream = T.stream('statuses/filter', {track: words()});

        // Binds the tweet event of the new stream to the emitTweet callback
        stream.on('tweet', emitTweet);

        stream.on('limit', function (limitMessage) {
            console.log('Twitter Limit', limitMessage);
        });

        stream.on('disconnect', function (disconnectMessage) {
            console.log('Twitter Disconnect', disconnectMessage);
        });

        stream.on('connect', function (request) {
            console.log('Twitter Connect');
        });

        stream.on('connected', function (request) {
            console.log('Twitter Connected');
        });

        console.log('Updated topic list:', words());
        console.log(topics);
    });

    socket.on('disconnect', function() {

        // Remove the client topics from the list. This will be effective
        // the next time the Twitter stream is started.
        topics = topics.filter(function(topic) {
            return (topic.client !== socket.id);
        });

    });

});

// Twitter Stream Events




