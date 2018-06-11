const { GenericCacheEntry } = require('../synapse/GenericCacheEntry');

const easyRequest = Symbol('easyRequest');
const cacheImplementation = Symbol('cacheImplementation');
const handleRequest = Symbol('handleRequest');
const updateCache = Symbol('updateCache');
const newEntry = Symbol('newEntry');
const addValueToCache = Symbol('addValueToCache');
const updateEntry = Symbol('updateEntry');

const DEFAULT_TTL = 1000 * 60 * 60 * 24; 

class EasyRequestWrapper {
  constructor(requestApi, cache) {
    this[easyRequest] = requestApi;
    this[cacheImplementation] = cache;

    this[handleRequest] = (options) => {
      return new Promise((resolve, reject) => {
        console.log(options);
        this[easyRequest].JSON(options, (err, response) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(response);
            resolve(response);
          }
        });
      });
    };

    this[updateCache] = (options, entryValue) => {
      return new Promise((resolve, reject) => {
        entryValue.response
        .then((result) => {
          this[updateEntry](options.url, result);
          resolve(result);
         })
        .catch((error) => {
          this[updateEntry](options.url, error);
          reject(error);
        });
      });
    };

    this[newEntry] = (options) => {
      return {
        response: this[handleRequest](options),
        timestamp: new Date().getTime(),
      };
    };

    this[addValueToCache] = (url, value, validity = DEFAULT_TTL) => {
      const cacheEntry = new GenericCacheEntry(value, validity);
      this[cacheImplementation].set(url, cacheEntry);
    };

    this[updateEntry] = (url, result) => {
      const validity = this[cacheImplementation].get(url).validity;
      this[addValueToCache](url, result, validity);
    };
  }

  JSON(options) {
    const entry = cache.get(options.url);
    let promise;
    if (!entry) {
      console.log('No entry!');
      const entryValue = this[newEntry](options);
      this[addValueToCache](options.url, entryValue, options.ttl);
      promise = this[updateCache](options, entryValue);
      console.log('Promise')
    } else {
      promise = entry.response;
    }

    return promise;
  }
}

module.exports = {
  EasyRequestWrapper, 
  DEFAULT_TTL,
}