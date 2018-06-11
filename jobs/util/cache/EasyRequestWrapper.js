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
        this[easyRequest].JSON(options, (err, response) => {
          if (err) {
            reject(err);
          } else {
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
        requestTimestamp: new Date().getTime(),
      };
    };

    this[addValueToCache] = (url, value, validity = DEFAULT_TTL) => {
      const cacheEntry = new GenericCacheEntry(value, validity);
      this[cacheImplementation].set(url, cacheEntry);
    };

    this[updateEntry] = (url, result) => {
      const entry = this[cacheImplementation].get(url);
      const validity = entry.validity;

      const value = entry.value;
      value.response = result;
      value.responseTimestamp = new Date().getTime();

      this[addValueToCache](url, value, validity);
    };
  }

  JSON(options) {
    console.log(options.url);
    const entry = this[cacheImplementation].get(options.url);
    let promise;
    if (!entry) {
      const entryValue = this[newEntry](options);
      this[addValueToCache](options.url, entryValue, options.ttl);
      promise = this[updateCache](options, entryValue);
    } else {
      console.log(entry);
      promise = entry.value.response;
    }

    console.log(promise);
  
    return promise;
  }
}

module.exports = {
  EasyRequestWrapper, 
  DEFAULT_TTL,
}