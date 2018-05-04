const url = require('url');
const https = require('https');
const { CacheOperator }  = require('../CacheOperator');

const wardenEndpoint = 'https://warden.thinkingphones.com/api/v1/users/';

function cachedWardenAuth(appToken, user, pass) {
  return new Promise(async (resolve, reject) => {
    const cache = CacheOperator.create();
    const found = cache.getUserToken(user);
  
    if (found && found.stillValid()) {
      resolve(found.token);
    } else {
      try {
        const result = await wardenAuth(appToken, user, pass);
        
        if (!result || !result.data || !result.data.grant || !result.data.grant.token) {
            reject('Could not authenticate');
        } else {
          cache.setUserToken(user, new AuthCacheEntry(user, result.data.grant.token));
          resolve(result.data.grant.token);
        }

      } catch (e) {
        reject(e);
      }
    }
  });
}

function wardenAuth(appToken, user, pass) {
  return new Promise(async (resolve, reject) => {

    try {
      const response = await getOptionId(appToken, user);
      if (response.status == 0) {
        const optionId = response.data.options[0].optionId;
        const postPassResponse = await postPassword(appToken, optionId, user, pass);
        resolve(postPassResponse);
      } else {
        resolve(response);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function getOptionId(appToken, user) {
  return new Promise((resolve, reject) => {
    const options = url.parse(`${wardenEndpoint}${user}/auth/options`);
    options.headers = {
      'X-Long-Encoding': 'string',
      'Authorization' : `Bearer ${appToken}`
    };

    const req = https.request(options, (response) => {
      let str = ''

      response.on('data', chunk => str += chunk);
      response.on('error', error => reject(error));

      response.on('end', (chunk) => {
        response = JSON.parse(str);
        resolve(response);
      });
    });

    req.end();
  });
}

function postPassword(appToken, optionId, user, pass) {
  return new Promise((resolve, reject) => {
    const options = url.parse(`${wardenEndpoint}${user}/auth/options/${optionId}`);
    options.headers = {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : `Bearer ${appToken}`
    }

    options.method = 'POST';

    const req = https.request(options, (response) => {
      let str = '';
      response.on('data', chunk => str += chunk );
      response.on('error', error => reject(error));
      response.on('end', (chunk) => {
        response = JSON.parse(str);
        resolve(response);
      });
    });

    req.write(`{password: "${pass}"}`);
    req.end();
  });
}

function verifyToken(wardenToken){
  return new Promise((resolve, reject) => {
    const options = url.parse("https://warden.thinkingphones.com/api/v1/tokens/current");
    options.headers = {
      'Accept': 'application/json',
      'Authorization' : `Bearer ${wardenToken}`
    };

    const req = https.request(options, (response) => {
      let str = '';
      response.on('data', chunk => str += chunk);
      response.on('error', error => reject(error));
      response.on('end', (chunk) => {
        response = JSON.parse(str);
        resolve(response);
      });
    });
    req.end();
  });
}

module.exports = {
  cachedWardenAuth,
  wardenAuth,
  verifyToken
}

