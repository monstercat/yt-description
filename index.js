
var monk = require('monk')
var argv = require('optimist').argv;
var async = require('async')
var mode = argv.mode || 'production'
var credentials  = require('./credentials')[mode];
var gapi = require('googleapis');
var OAuth2 = gapi.OAuth2Client;
var db = monk('localhost/' + 'youtube');
var Videos = db.get('Videos');
var state = {};

function updateVideo(param, done){
  console.log('show update video updated');
  var video = param.video
  var client = param.client
  var oauth = param.oauth
  var videoId = video.id
  var now = new Date().getTime();
  var oldDescription = video.snippet.description
  var newMessage = "Monstercat 018 - Frontier is out now! \n Show your support:http://monstercat.com/frontier \n ---------\n"
  var needUpdate = checkNeedUpdate(oldDescription, "Monstercat 018 - Frontier is out now!");

  if(!needUpdate){
    console.log(videoId + " don't need to update");
    return done(null, null);
  }

  var newVideo = {
    videoId: videoId,
    timeStamp: now,
    description: video.snippet.description 
  }

  Videos.insert(newVideo, function(err, doc){
    if(err){
      console.log('insert video error: ');
      console.log(err)
    }

    video.snippet.description = newMessage + video.snippet.description

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
  }); 
};

function updateDescription() {
  gapi.discover('youtube', 'v3').execute(function(err, client){
    state.playlist = require('yt-playlist')(client);

    var CLIENT_ID = credentials.client_id;
    var CLIENT_SECRET = credentials.client_secret;
    var access_token = credentials.access_token;
    var refresh_token = credentials.refresh_token;
    var oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET);
    var channelId = 'UCJ6td3C9QlPO9O_J5dF4ZzA'

    oauth.credentials = {
      access_token: access_token,
      refresh_token: refresh_token
    };
    
    var params = {
      channelId:channelId,
      oauth: oauth,
    }

    getPlayListItems(params, function(err, vids){
      console.log('get videos on channel');
      console.log(vids);
      console.log(vids.length);

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
      
      async.each(vids, update, function(err, result){
        console.log('finish update videos');
        return
      }); 
    });
  });
};

function getPlayListItems(params, done){
  state.playlist(params.channelId, params, function(err, res){
    var items = res.items
    if(res.nextPageToken){
      params.pageToken = res.nextPageToken;
      getPlayListItems(params, function(err, next_items){
        return done(err, items.concat(next_items)); 
      });
    }else{
      return done(err, items);
    }
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
};

function checkNeedUpdate(oldDescription, newDescription){
  var n = oldDescription.search(newDescription);

  if(n >= 0){
    return false;
  }else{
    return true;
  }
}

updateDescription();

