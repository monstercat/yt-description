
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
  var videoId = video.id

  video.snippet.description = video.snippet.description + " yx3zhang"

  var resource = {
    id: videoId,
    snippet: video.snippet
  };

  var req = client.youtube.videos.update({ part: 'id,snippet' }, resource);

  req.withAuthClient(oauth).execute(function(err, res){
    if(err){
      console.log(videoId + "has error:");
      console.log(err);
    }else{
      console.log(videoId + " updated");
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
        playListItemToVideo(param, function(err, video){
          if(!video){
            return cb (null);
          }

          param.video = video;
          updateVideo(param, cb);
        });
      }
      
      async.each(vids.items, update, function(err, result){
        console.log('finish update videos')
      }); 
    });
  });
};

function playListItemToVideo(param, done){
  var client = param.client;
  var oauth = param.oauth;
  var videoId = param.video.snippet.resourceId.videoId
  var req = client.youtube.videos.list({ part: 'id,snippet', id: videoId });

  req.withAuthClient(oauth).execute(function(err, res){
    if(!res || res.items.length <=0){
      return doen(null,null);
    }

    return done(err, res.items[0]);
  });
}

updateDescription();

