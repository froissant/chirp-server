// Chirp Server
// ------------

// Import the Node modules
var Twit     = require('twit'),         // Twitter API Client
    IOServer = require('socket.io'),    // Client-side communication
    config   = require('./config.js');  // Twitter Credentials

// List of topics to track
var topics = [];

// Configure the Twit object with the application credentials
var T = new Twit(config),
    twitterStream = null;

// Retrieve the given attribute for all the element in the list
function pluck(list, attribute) {
    return list.map(function(item) { return item[attribute]; });
}

// Callbacks for Twit Stream Events
// --------------------------------

// Connection attempt (`connect` event)
function twitOnConnect(req) {
    console.log('[Twitter] Connecting...');
}

// Successful connection (`connected` event)
function twitOnConnected(res) {
    console.log('[Twitter] Connection successful.');
}

// Reconnection scheduled (`reconnect` event).
function twitOnReconnect(req, res, interval) {
    var secs = Math.round(interval / 1e3);
    console.log('[Twitter] Disconnected. Reconnection scheduled in ' + secs + ' seconds.');
}

// Disconnect message from Twitter (`disconnect` event)
function twitOnDisconnect(disconnectMessage) {
    // Twit will stop itself before emitting the event
    console.log('[Twitter] Disconnected.');
}

// Limit message from Twitter (`limit` event)
function twitOnLimit(limitMessage) {
    // We stop the stream explicitely.
    console.log('[Twitter] Limit message received. Stopping.');
    twitterStream.stop();
}

// A tweet is received (`tweet` event)
function twitOnTweet(tweet) {

    // Process only geotagged tweets
    if (tweet.coordinates) {

        // Convert the tweet text to lowercase to find the topics
        var tweetText = tweet.text.toLowerCase();

        // Check if any of the topics is contained in the tweet text
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
var port = 9720,
    io = new IOServer(port);

console.log('Listening for incomming connections in port ' + port);


// A clients established a connection with the server
io.on('connection', function(socket) {

    // Displays a message in the console when a client connects
    console.log('Client ', socket.id, ' connected.');

    socket.on('add', function(topic) {

        // Adds the new topic to the topic list
        topics.push({word: topic.word.toLowerCase(), socket: socket});

        console.log('Adding the topic "' + topic.word + '"');
        console.log('Updated topic list: "' + pluck(topics, 'word') + '"');

        // Stop the stream to include additional topics
        if (twitterStream) {
            twitterStream.stop();
        }

        // Creates a new stream object, tracking the updated topic list
        twitterStream = T.stream('statuses/filter', {track: pluck(topics, 'word')});

        // Add listeners for the stream events to the new stream instance
        twitterStream.on('tweet',      twitOnTweet);
        twitterStream.on('connect',    twitOnConnect);
        twitterStream.on('connected',  twitOnConnected);
        twitterStream.on('reconnect',  twitOnReconnect);
        twitterStream.on('limit',      twitOnLimit);
        twitterStream.on('disconnect', twitOnDisconnect);
    });

    // If the client disconnects, we remove its topics from the list
    socket.on('disconnect', function() {
        console.log('Client ' + socket.id + ' disconnected.');
        topics = topics.filter(function(topic) {
            return topic.socket.id !== socket.id;
        });
    });
});