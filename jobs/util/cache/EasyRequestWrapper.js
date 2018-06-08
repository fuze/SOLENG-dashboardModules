const easyRequest = Symbol('easyRequest');
const cacheImplementation = Symbol('cacheImplementation');
const handleRequest = Symbol('handleRequest');
const updateCache = Symbol('updateCache');
const newEntry = Symbol('newEntry');

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
          this[cacheImplementation].set(options.url, result);
          resolve(result);
         })
        .catch((error) => {
          this[cacheImplementation].set(option.url, error);
          reject(error);
        });
      });

    };

    this[newEntry] = (options) => {
      return {
        response: this[handleRequest](options),
        timestamp: new Date().getTime(),
        ttl: options.ttl || DEFAULT_TTL,
      };
    };
  }

  JSON(options) {
    const entry = cache.get(options.url);
    let promise;
    if (!entry) {
      const entryValue = this[newEntry]();
      this[cacheImplementation].set(options.url, entryValue);
      promise = this[updateCache](options, entryValue);
    } else {
      if (entry.timestamp > (new Date().getTime() - entry.ttl)) {
        promise = entry.response;
      } else {
        const entryValue = this[entryValue]();
        this[cacheImplementation].set(options.url, entryValue);
        promise = this[updateCache](options, entryValue);
      }
    }

    return promise;
  }
}

module.exports = {
  EasyRequestWrapper
}