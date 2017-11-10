https = require('https');
url = require('url');

warden = require('./wardenNodeAuth.js')

const appToken = "2.M9G01Num4hZ08KQ.YXBwbGljYXRpb246dmh5NE5MMUU4UToyMU5VUk5Cd2NQ"

var exports = module.exports = {}
exports.getPeerOwner = getPeerOwner

function getPeerOwner (credentials, peers, callback) {
  if (typeof credentials === "object") {  //if we are provided with a username and password
    warden.wardenAuth(appToken, credentials.user, credentials.pass, process)
  } else if (typeof credentials === "string") { //if we are provided with a warden token
    verifyToken(credentials, process) 
  }

  function process (response){
    var wardenToken = response.data.grant.token
    getUserList(wardenToken, function (users) {
      result = filterUsers(users, peers)
      callback (result)
    });
  }
}

function getUserList (wardenToken, callback) {
  var options = url.parse('https://rest.data-stage.fuze.com/users')
  options.headers = {"Authorization" : "Bearer " + wardenToken}
  var req = https.request(options, function (response){
    var str = ''
    response.on('data', function (chunk) {
      str += chunk
    });
    response.on('end', function(chunk) {
      console.log(str.toString())
      response = JSON.parse(str)
      callback(response.users)
    });
  });
  req.end()
}

function parsePeername (peer) {
  var regex = /(SIP\/)?(.*)-\D(\d{4})-?(\d{4})?.*/g;

  var parsed = regex.exec(peer)
  var vcx = parsed[2]
  if (parsed[4]){
    var  rootExtension = parsed[4]
  } else {
    var  rootExtension = parsed[3]
  }
  return {
    peer: peer,
    vcx: vcx,
    extension: rootExtension
  }
}

function filterUsers(users, peers) {
  if (typeof peers == "string"){ //if we only have one peer
    extension = parsePeername(peers)
  } else if (typeof peers == "object"){ //if we are an array of peers
    parsedPeer = []
    for (i in peers){
    parsedPeer.push(parsePeername(peers[i]))
    }
  }

  filteredList = users.filter(function(user){
    if (user.did){
      var thisExtension = user.did.substring(user.did.length-4, user.did.length)
      if (!parsedPeer.length && thisExtension == parsedPeer.extension){ //if we are filtering for a single extension
        user.peer = parsedPeer.peer
        return (true)
      } else if (parsedPeer.length){ //if we are filtering for multiple extensions
        for (i in parsedPeer){
          if (thisExtension==parsedPeer[i].extension){
            user.peer = parsedPeer[i].peer
            return true
          }
        }
      }
    } else {
      return false
    }
  });
  return filteredList
}

//peer = "THINKINGPHONES-u6610-4"
//peerList = ["THINKINGPHONES-u3832", "THINKINGPHONES-u4941"]
//parsedPeer = parsePeername(peer)
//extension = parsedPeer[1]
//token = '2.tSe2R-6TbrI004a.dXNlcjpjMlZDeFhIWlVWOjg4eU1ZN3J3V2I'

//getUserList(token, function (users) {
//  name = filterUsers(users,extension)
//  name = filterUsers(users,peerList)
//  console.log(name)
//  })
