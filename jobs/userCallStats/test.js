const getPeerOwner = require('./fuzeUtil/peerOwner.js').getPeerOwner

var creds = {
  user: "wbadmin.thinkingphones",
  pass: "Fuze!234"
}
var peers = ['SIP/THINKINGPHONES-x6497','THINKINGPHONES-x2077','THINKINGPHONES-x2801']

getPeerOwner (creds, peers, function (result){console.log(result)});
