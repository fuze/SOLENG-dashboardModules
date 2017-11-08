//var exports = module.exports = {}

var url = require('url')
var https = require('https')

var exports = module.exports = {}
exports.wardenAuth = wardenAuth
exports.verifyToken = verifyToken

//wardenAuth("APP TOKEN", "USERNAME", "PASSWORD", function (response){console.log(response)});
//verifyToken("WARDEN TOKEN", function (response){console.log(response)});

function wardenAuth (appToken, user, pass, callback) {
  getOptionId(appToken, user, function(response) {
    if (response.status == 0){
      var optionId = response.data.options[0].optionId
      postPassword(appToken, optionId, user, pass, callback)
    } else { //if the getOptionId fails, return that result
      callback(response)
    }
  });

}

function getOptionId (appToken, user, callback) {
  var options = url.parse("https://warden.thinkingphones.com/api/v1/users/" + user + "/auth/options")
  options.headers = {
    "X-Long-Encoding": "string",
    "Authorization" : "Bearer " + appToken
  }

  var req = https.request(options, function (response){
    var str = ''
    response.on('data', function (chunk) {
      str += chunk
    });
    response.on('end', function(chunk) {
      response = JSON.parse(str)
      callback(response)
    });
  });
  req.end()
}

function postPassword (appToken, optionId, user, pass, callback) {
  var options = url.parse("https://warden.thinkingphones.com/api/v1/users/" + user + "/auth/options/" + optionId)
  options.headers = {
    "Content-Type" : "application/json",
    "Accept" : "application/json",
    "Authorization" : "Bearer " + appToken
  }
  options.method = 'POST'
  var req = https.request(options, function (response){
    var str = ''
    response.on('data', function (chunk) {
      str += chunk
    });
    response.on('end', function(chunk) {
      response = JSON.parse(str)
      callback(response)
    });
  });
  req.write('{password: "' + pass + '"}')
  req.end()
}

function verifyToken (wardenToken, callback){
  var options = url.parse("https://warden.thinkingphones.com/api/v1/tokens/current")
  options.headers = {
    "Accept": "application/json",
    "Authorization" : "Bearer " + wardenToken
  }

  var req = https.request(options, function (response){
    var str = ''
    response.on('data', function (chunk) {
      str += chunk
    });
    response.on('end', function(chunk) {
      response = JSON.parse(str)
      callback(response)
    });
  });
  req.end()
}

