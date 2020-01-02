const https = require('https');
const url = require('url');
const { CacheOperator } = require('../CacheOperator');

function getCachedPeerOwner(credentials, peers) {
  return new Promise(async (resolve, reject) => {
    const cache = CacheOperator.create();

    const cachedPeers =
      peers.map((peer) => {
        const found = cache.getPeerInfo(peer);
        return found && found.stillValid() ? found.value : peer;
      });

    const nonCachedPeers =
      peers.filter(
        peer => cache.getPeerInfo(peer) === undefined || !cache.getPeerInfo(peer).stillValid()
      );
    try{
      const apiResponses = await getPeerOwner(credentials, nonCachedPeers).catch((err) => {throw err});
      apiResponses.forEach(response => cache.setPeerInfo(response.originalPeerId, response));
      resolve(cachedPeers.concat(apiResponses));
    } catch (err) {return reject(err)}
  });
}

function getPeerOwner(credentials, peers) {
  return new Promise(async (resolve, reject) => {
    const promises = peers.map(peer => getPeerInfo(credentials, peer));
    try {
      const results = await Promise.all(promises).catch((err) => {
        throw err
      });

      const peerOwners = results.filter(result => typeof result !== 'error').map(result => {
        return {
          "peer" : result.peers[0].peerName, 
          "displayName" : result.peers[0].user.displayName,
          "originalPeerId" : result.originalPeerId
        }
      });

      resolve(peerOwners);
    } catch (err) {return reject (err)}
  });
}

function getPeerInfo(credentials, peer) {
  return new Promise((resolve, reject) => {
    const originalPeerId = peer;

    // strip SIP identifier
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
        response.on('error', (error) => reject(error));
        response.on('end', (chunk) => {
          response = JSON.parse(str);
          if (response.peers && response.peers[0] && response.peers[0].user && response.peers[0].user.displayName) {
            const peers = response.peers;
            resolve({
              peers,
              originalPeerId
            });
          } else {
            console.log("Error: Unable to find name associated with peer '" + originalPeerId + "'. Please ensure peer exists in the portal. If they do not, reach out to Support to get the peer removed from the queue.")
            resolve(
              {
                "peers" : [{
                  "peerName" : originalPeerId, 
                  "user": {"displayName" : originalPeerId}
                  }],
                "originalPeerId" : originalPeerId
              });
          }
        });
      } else {
        reject("Bad status code " + response.statusCode + " from https://synapse.thinkingphones.com/tpn-webapi-broker/services/peers");
      }
    });

    req.write('{"tenant": "' + credentials.tenant + '", "peerName": "' + peer + '"}');
    req.end();
  });
}

module.exports = {
  getPeerOwner,
  getCachedPeerOwner,
}
