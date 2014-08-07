var argv         = require('optimist').argv;
var mode = argv.mode || 'production'
var credentials  = require('./credentials')[mode];
var gapi = require('googleapis');
var OAuth2 = gapi.OAuth2Client;

function updateDescription() {
  gapi.discover('youtube', 'v3').execute(function(err, client){
    var CLIENT_ID = credentials.client_id;
    var CLIENT_SECRET = credentials.client_secret;
    var access_token = credentials.access_token;
    var refresh_token = credentials.refresh_token;

    var oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET);

    oauth.credentials = {
      access_token: access_token,
      refresh_token: refresh_token
    };

    var req = client.youtube.channels.list({
      id: "UCeDAMjAoztnS1WYGLzB2P_w",
      part: 'contentDetails'
    });

    req.withAuthClient(oauth)

    req.execute(function(err, res){
      console.log(err)
      console.log(res);
    });
  });
}

updateDescription();
