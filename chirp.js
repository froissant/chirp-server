// Chirp Server
// ------------

// Import the Node modules
var Twit     = require('twit'),           // Twitter API Client
    IOServer = require('socket.io'),      // Client-side communication
    config   = require('./config.json');  // Twitter Credentials

// Configure the Twit object with the application credentials
var T = new Twit(config);

// Create a new instance of the Socket.IO Server
var io = new IOServer(9720);

// List of topics to listen.
var topics = [
    {word: 'morning', client: 'server'},
    {word: 'night',   client: 'server'}
];

function words() {
    return topics.map(function(d) { return d.word; });
}

// Initializes the twitter filter stream, tracking the words in the
// topic list.
var stream = T.stream('statuses/filter', {track: words()});

stream.on('tweet', function(tweet) {

    if (tweet.coordinates) {

        topics.forEach(function(topic) {

            if (tweet.text.toLowerCase().indexOf(topic.word) > 0) {

                var clientSocket = io.of('/').connected[topic.client];

                if (clientSocket) {
                    clientSocket.emit('tweet', {
                        word: topic.word,
                        coordinates: tweet.coordinates
                    });
                }
            }

        });

    }



    // console.log(tweet.text);
    // console.log('.');


});

io.on('connection', function(socket) {

    console.log('client', socket.id, 'connected.');

    socket.on('add', function(topic) {

        // Adds a new topic to the list.
        topics.push({word: topic.word, client: socket.id});

        console.log('Updated topic list:');
        console.log(topics);

    });

});


// function emitTweet(tweet) {

//     if (tweet.coordinates) {

//         topics.forEach(function(topic) {

//             if (tweet.text.toLowerCase().indexOf(topic.word) > 0) {

//                 var socket = io.of('/').connected[topic.client];

//                 if (socket) {
//                     socket.emit('tweet', tweet);
//                 }

//                 // if (io.sockets().connected[topic.client]) {
//                 //     io.sockets(topic.client).emit({data: 'one'});
//                 //     console.log(tweet.text);
//                 // }


//             }

//         });

//     }
// }

// stream.on('tweet', emitTweet);


// // // Subscribe to the stream sample, for tweets in english
// // var stream = T.stream('statuses/filter', {track: wordList(topics)});

// // Client Connection
// io.sockets.on('connection', function(socket) {

//     console.log('client ' + socket.id + ' connected.');



//     // The client adds a new word to the topic list
//     socket.on('add', function(topic) {

//         var socketA = io.of('/').connected[socket.id];

//         if (socketA) {
//             socketA.emit('tweet', {word: 'working'});
//             console.log('working');
//         }

//         console.log(topic);
//         topics.push({word: topic.word, client: socket.id});

//         console.log('Adding the topic "' + topic.word + '" from client ' + socket.id);
//         console.log('Updated word list: ');
//         console.log(words());

//         // Reset the streaming connection to update the list of topics to track
//         stream.stop();
//         stream = T.stream('statuses/filter', {track: words()});

//         // Bind the 'tweet' event of the new stream to the parseTweet callback.
//         stream.on('tweet', emitTweet);
//     });

//     socket.on('disconnect', function() {

//         console.log('client disconnected');
//         // Remove the topics listened for the disconnected client. The topics
//         // will stop being listened on the next topic-add operation.
//         topics = topics.filter(function(topic) {
//             return topic.client !== socket.id;
//         });
//     });

// });


// // The callback will be invoked on each tweet. Here, we print the username
// // and the text of the tweet in the screen.
// stream.on('tweet', parseTweet);

// // The 'connect' callback is invoked when the Twitter API Client
// // tries to connect to Twitter
// stream.on('connect', function(msg) {
//     console.log('connect');
// });

// // The 'connected' event is triggered when the connection is successful
// stream.on('connected', function(msg) {
//     console.log('connected');
// });

// // The 'warning' event is triggered if the client is not processing the
// // tweets fast enough.
// stream.on('warning', function(msg) {
//     console.log('warning');
// });

// // The 'disconnect' event is triggered when a disconnect message comes from
// // Twitter.
// stream.on('disconnect', function(msg) {
//     console.log('disconnect');
// });

