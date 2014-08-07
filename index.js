var argv         = require('optimist').argv;
var gapi = require('googleapis');
var mode = argv.mode || 'production'
var credentials  = require('./credentials')[mode];
var OAuth2 = gapi.auth.OAuth2

var CLIENT_ID = credentials.client_id;
var CLIENT_SECRET = credentials.client_secret;
var access_token = credentials.access_token;
var refresh_token = credentials.refresh_token;  

var oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET);
var youtube = gapi.youtube({ version: 'v3', auth: oauth });

function updateDescription() {
  console.log(CLIENT_ID);
  console.log(CLIENT_SECRET); 

  oauth.credentials = {
    access_token: access_token,
    refresh_token: refresh_token
  };

  console.log('send request');

  youtube.channels.list({
    id: 'UCeDAMjAoztnS1WYGLzB2P_w',
    part: 'contentDetails',
    auth: oauth
  },function(err, res){
    console.log('show response');
    if(err){ 
      console.log(err)
    }

    console.log(res);
  });

}

updateDescription();
