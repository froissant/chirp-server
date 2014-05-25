// Example 01
//
//    Printing the tweets from the Twitter stream sample (english)
//  to the screen.
//
//  Note: To use this example, the file 'config.json' should contain
//  valid Twitter credentials. To create your own credentials, follow
//  the guidelines described in README.md

// Import the Node modules
var Twit   = require('twit'),           // Twitter API Client
    config = require('./config.json');  // Twitter Credentials

// Create a Twitter c
var T = new Twit(config);

// Subscribe to the stream sample, for tweets in english
var stream = T.stream('statuses/sample', {language: 'en'});

// The callback will be invoked on each tweet. Here, we print the username
// and the text of the tweet in the screen.
stream.on('tweet', function(tweet) {
    console.log('@' + tweet.user.screen_name + ': ' + tweet.text.slice(0, 50) + '...');
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

});

// The 'disconnect' event is triggered when a disconnect message comes from
// Twitter.
stream.on('disconnect', function(msg) {
    console.log('disconnect');
});