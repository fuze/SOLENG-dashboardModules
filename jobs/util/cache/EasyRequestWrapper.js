const { GenericCacheEntry } = require('../synapse/GenericCacheEntry');

const easyRequest = Symbol('easyRequest');
const cacheImplementation = Symbol('cacheImplementation');
const handleRequest = Symbol('handleRequest');
const updateCache = Symbol('updateCache');
const createNewEntry = Symbol('createNewEntry');
const addValueToCache = Symbol('addValueToCache');
const updateEntry = Symbol('updateEntry');
const isCached = Symbol('isCached');

const DEFAULT_TTL = 1000 * 60 * 60 * 24;
const DEFAULT_CACHED = true;

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
            console.log('Request Options:');
            console.log(options);
            console.log('-----');
            console.log('Response:')
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

    this[createNewEntry] = (options) => {
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

    this[isCached] = (options) => {
      let cached = DEFAULT_CACHED;

      if (options.cached) {
        cached = options.cached;
      }

      return cached;
    }; 
  }

  JSON(options) {
    let promise;

    if (!this[isCached](options)) {
      promise = this[handleRequest](options);
    } else {
      console.log(`Checking url ${options.url}`);
      const entry = this[cacheImplementation].get(options.url);
      if (!entry) {
        console.log('Cache miss');
        const entryValue = this[createNewEntry](options);
        this[addValueToCache](options.url, entryValue, options.ttl);
        promise = this[updateCache](options, entryValue);
        console.log('cache miss value');
        console.log(promise);
      } else {

        // TODO:
        // pseudo-code
        // the isValid checks if the entry is within the ttl. Each entry has a response and a requestTimestamp you can use
        // if (entry.stillValid())
        // {
        //  promise = entry.value.response
        // } else {
        // This is a new method to remove the element from the cache. only happens if the value to return is not valid
        //  this[cacheImplementation].deleteFromCache(entry.value);
        // }

        console.log('Cache hit');
        promise = entry.value.response;
        console.log('cache hit value');
        console.log(promise);
      }
    }

    console.log('Going to return...');
    console.log(promise);
  
    return promise;
  }
}

module.exports = {
  EasyRequestWrapper, 
  DEFAULT_TTL,
}