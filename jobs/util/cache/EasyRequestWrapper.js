const { GenericCacheEntry } = require('../synapse/GenericCacheEntry');

const easyRequest = Symbol('easyRequest');
const cacheImplementation = Symbol('cacheImplementation');
const handleRequest = Symbol('handleRequest');
const updateCache = Symbol('updateCache');
const createNewEntry = Symbol('createNewEntry');
const addValueToCache = Symbol('addValueToCache');
const updateEntry = Symbol('updateEntry');
const isCached = Symbol('isCached');
const isValid = Symbol('isValid');

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
      const entry = this[cacheImplementation].get(options.url);
      if (!entry || !entry.stillValid()) {
        const entryValue = this[createNewEntry](options);
        this[addValueToCache](options.url, entryValue, options.ttl);
        promise = this[updateCache](options, entryValue);

      } else {
        promise = entry.value.response;
      }
    }
    return promise;
  }
}

module.exports = {
  EasyRequestWrapper, 
  DEFAULT_TTL,
}
