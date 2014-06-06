// Chirp Server
// ------------

// Import the Node modules
var Twit     = require('twit'),         // Twitter API Client
    IOServer = require('socket.io'),    // Client-side communication
    config   = require('./config.js');  // Twitter Credentials


// Configure the Twit object with the application credentials
var T = new Twit(config),
    twitterStream = null;

// List of topics to listen.
var topics = [];

function pluck(list, attribute) {
    return list.map(function(item) { return item[attribute]; });
}

// Twitter Streaming Callbacks
// ---------------------------

function twitterOnConnect(req) {
    console.log('[Twitter] Connecting...');
}

function twitterOnConnected(res) {
    console.log('[Twitter] Connection successful.');
}

function twitterOnReconnect(req, res, interval) {
    var secs = Math.round(interval / 1e3);
    console.log('[Twitter] Disconnected. Reconnection scheduled in ' + secs + ' seconds.');
}

function twitterOnDisconnect(disconnectMessage) {
    console.log('[Twitter] Disconnected.');
}

function twitterOnLimit(limitMessage) {
    console.log('[Twitter] Limit message received. Stopping.');
    twitterStream.stop();
}

function twitterOnTweet(tweet) {

    // Process only geotagged tweets
    if (tweet.coordinates) {

        // Convert the tweet text to lowercase to find the topics
        var tweetText = tweet.text.toLowerCase();

        // Check if the
        topics.forEach(function(topic) {

            // Checks if the tweet text contains the topic
            if (tweetText.indexOf(topic.word) !== -1) {

                // Sends a simplified version of the tweet to the client
                topic.socket.emit('tweet', {
                    id: tweet.id,
                    coordinates: tweet.coordinates,
                    word: topic.word
                });
            }
        });
    }
}


// Client Side Communication
// -------------------------

// Create a new instance of the Socket.IO Server
var io = new IOServer(9720);


// A clients established a connection with the server
io.on('connection', function(socket) {

    // Displays a message in the console when a client connects
    console.log('Client ', socket.id, ' connected.');

    socket.on('add', function(topic) {

        // Adds the new topic to the topic list
        topics.push({word: topic.word.toLowerCase(), socket: socket});

        console.log('Adding the topic "' + topic.word + '"');
        console.log('Updated topic list: "' + pluck(topics, 'word') + '"');

        // Stop the stream to include the additional topics
        if (twitterStream) {
            twitterStream.stop();
        }

        // Creates a new stream object, tracking the updated topic list
        twitterStream = T.stream('statuses/filter', {track: pluck(topics, 'word')});

        twitterStream.on('tweet',      twitterOnTweet);
        twitterStream.on('connect',    twitterOnConnect);
        twitterStream.on('connected',  twitterOnConnected);
        twitterStream.on('reconnect',  twitterOnReconnect);
        twitterStream.on('limit',      twitterOnLimit);
        twitterStream.on('disconnect', twitterOnDisconnect);
    });

    socket.on('disconnect', function() {
        // Remove the topics of the disconnected client
        topics = topics.filter(function(topic) {
            return topic.socket.id !== socket.id;
        });
    });
});