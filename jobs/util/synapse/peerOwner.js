const https = require('https');
const url = require('url');
const { CacheOperator } = require('../CacheOperator');

async function getCachedPeerOwner(credentials, peers) {
  return new Promise((resolve) => {
    const cache = CacheOperator.create();

    const cachedPeers =
      peers.filter(
        peer => cache.getPeerInfo(peer) !== undefined && cache.getPeerInfo(peer).stillValid()
      );
    
    const nonCachedPeers =
      peers.filter(
        peer => cache.getPeerInfo(peer) === undefined || !cache.getPeerInfo(peer).stillValid()
      );
    
    const apiResponses = await getPeerOwner(credentials, nonCachedPeers);
    apiResponses.forEach(response => cache.setPeerInfo(response.originalPeerId, response));

    resolve(cachedPeers.concat(nonCachedPeers))
  });
}

async function getPeerOwner(credentials, peers) {
  return new Promise((resolve) => {
    const promises = peers.map(peer => getPeerInfo(credentials, peer));
    const results = await Promise.all(promises);

    const peerOwners = results.filter(result => typeof result !== 'error')
      .map(result => {
        return {
          "peer" : result.response.peers[0].peerName, 
          "displayName" : result.response.peers[0].user.displayName,
          "originalPeerId" : result.originalPeerId
        }
      });

    resolve(peerOwners);
  });
}

function getPeerInfo(credentials, peer) {
  return new Promise((resolve) => {
    //strip SIP identifier
    if (peer.substring(0,4) === 'SIP/') { 
      peer = peer.substring(4);
    }

    const options = url.parse('https://synapse.thinkingphones.com/tpn-webapi-broker/services/peers');
    options.method = 'POST';
    options.headers = {
      "username" : credentials.user,
      "password" : credentials.pass
    };

    const req = https.request(options, (response) => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', (chunk) => str += chunk);
        response.on('error', (error) => resolve(error));
        response.on('end', (chunk) => {
          response = JSON.parse(str);
          if (response.peers[0] && response.peers[0].user && response.peers[0].user.displayName) {
            resolve({
              response,
              originalPeerId: peer
            });
          } else {
            resolve(badResponse());
          }
        });
      } else {
        resolve(badResponse());
      }
    });

    req.write('{"tenant": "' + credentials.tenant + '", "peerName": "' + peer + '"}');
    req.end();

    function badResponse() {
      return {'peers': [{'peerName': peer, 'user': {'displayName': peer}}]}
    }
  });
}

module.exports = {
  getPeerOwner,
  getCachedPeerOwner,
}
