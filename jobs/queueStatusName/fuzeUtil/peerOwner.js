https = require('https');
url = require('url');

warden = require('./wardenNodeAuth.js')

var exports = module.exports = {}
exports.getPeerOwner = getPeerOwner

function getPeerOwner (credentials, peers, callback) {
  let peerOwners = []
  for (i in peers){
    getPeerInfo(credentials, peers[i], (response) => {
      let peerInfo = {
        "peer": response.peers[0].peerName,
        "displayName": response.peers[0].user.displayName 
      }
      peerOwners.push(peerInfo)
      if (peerOwners.length == peers.length){

        callback(peerOwners)
      }
    })
  }

  function process (response){
    var wardenToken = response.data.grant.token
    getUserList(wardenToken, function (users) {
      result = filterUsers(users, peers)
      callback (result)
    });
  }
}

function getPeerInfo (credentials, peer, callback) {
  if (peer.substring(0,4) == "SIP/"){ //strip SIP identifier
    peer = peer.substring(4)
  }
  var options = url.parse('https://synapse.thinkingphones.com/tpn-webapi-broker/services/peers')
  options.method = 'POST'
  options.headers = {
    "username" : credentials.user,
    "password" : credentials.pass}
//  console.log(options)
  var req = https.request(options, function (response){
    if (response.statusCode == 200){
      var str = ''
      response.on('data', function (chunk) {
        str += chunk
      });
      response.on('end', function(chunk) {
        response = JSON.parse(str)
        if (response.peers && response.peers.user && response.peers.user.displayName){
          callback(response)
        } else {
          badResponse()
        }
      });
    } else {
      badResponse()
    }
  });
  req.write('{"tenant": "' + credentials.tenant + '", "peerName": "' + peer + '"}')
  req.end()

  function badResponse (){
    callback({'peers': [{'peerName': peer, 'user': {'displayName': peer}}]})
  }
}
