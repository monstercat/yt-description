
var argv = require('optimist').argv;
var async = require('async')
var mode = argv.mode || 'production'
var credentials  = require('./credentials')[mode];
var gapi = require('googleapis');
var OAuth2 = gapi.OAuth2Client;

function updateVideo(param, done){
  var video = param.video
  var client = param.client
  var oauth = param.oauth
  var videoId = video.snippet.resourceId.videoId

  var originalDescription = video.snippet.description;
  var newDescription = originalDescription + " haha1 updated haha2"

  video.snippet.description = newDescription;

  var resource = {
    snippet: video.snippet,
    id: video.snippet.resourceId.videoId
  };

  var req = client.youtube.videos.update({
    resource: resource,
    part: 'id,snippet'
  });

  req.withAuthClient(oauth).execute(function(err, res){
    if(err){
      console.log(videoId + "has error:");
      console.log(err);
      console.log("");
    }else{
      console.log(videoId + "updated");
    }

    return done(err, res);
  });
};  

function updateDescription() {
  gapi.discover('youtube', 'v3').execute(function(err, client){
    var playlist = require('yt-playlist')(client);
    var CLIENT_ID = credentials.client_id;
    var CLIENT_SECRET = credentials.client_secret;
    var access_token = credentials.access_token;
    var refresh_token = credentials.refresh_token;
    var oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET);
    var channelId = 'UCeDAMjAoztnS1WYGLzB2P_w'

    oauth.credentials = {
      access_token: access_token,
      refresh_token: refresh_token
    };

    playlist(channelId, { oauth: oauth }, function(err, vids) {
      console.log('get videos on channel');
      if(err){
        console.log(err);
        return
      }

      update = function(video, cb){
        var param = { video: video, client: client, oauth: oauth }
        updateVideo(param, cb);
      }
      
      async.each(vids.items, update, function(err, result){
        console.log('finish update videos')
      }); 
    });
  });
};

updateDescription();

