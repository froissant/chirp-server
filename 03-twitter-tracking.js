// Example 02: Filtering the Twitter Stream
//

// Import the Node modules
var Twit   = require('twit'),           // Twitter API Client
    config = require('./config.json');  // Twitter Credentials

// Create a Twitter c
var T = new Twit(config);

var topics = [
    {word: 'coffee', count: 0},
    {word: 'tea',    count: 0},
    {word: 'cocoa',  count: 0}
];

var words = topics.map(function(d) { return d.word; })

// Subscribe to the stream sample, for tweets in english
var stream = T.stream('statuses/filter', {track: words});

// The callback will be invoked on each tweet. Here, we print the username
// and the text of the tweet in the screen.
stream.on('tweet', function(tweet) {

    // Find the to
    topics.forEach(function(topic) {

        if (tweet.text.toLowerCase().indexOf(topic.word) > 0) {
            topic.count += 1;
        }

        var spaces = Array(15 - topic.word.length).join(' ');

        process.stdout.write(topic.word + ': ' + spaces + Array(topic.count).join('=') + '\r');
    });

    console.log('\n');

});

// The 'connect' callback is invoked when the Twitter API Client
// tries to connect to Twitter
stream.on('connect', function(msg) {
    console.log('connect');
});

// The 'connected' event is triggered when the connection is successful
stream.on('connected', function(msg) {
    console.log('connected');
});

// The 'warning' event is triggered if the client is not processing the
// tweets fast enough.
stream.on('warning', function(msg) {
    console.log('warning');
});

// The 'disconnect' event is triggered when a disconnect message comes from
// Twitter.
stream.on('disconnect', function(msg) {
    console.log('disconnect');
});