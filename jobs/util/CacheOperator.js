const cacheProp = Symbol('cache');
const { InMemoryCache } = require('./cache/InMemoryCache');
const { GenericCacheEntry } = require('./synapse/GenericCacheEntry');

class CacheOperator {
  constructor(cache) {
    this[cacheProp] = cache;
  }

  getUserToken(user) {
    return this[cacheProp].get(`user_${user}`);
  }

  setUserToken(user, value) {
    this[cacheProp].set(`user_${user}`, value);
  }

  getPeerInfo(peer) {
    return this[cacheProp].get(`peer_${peer}`);
  }

  setPeerInfo(peer, value) {
    const entry = new GenericCacheEntry(value);
    this[cacheProp].set(`peer_${peer}`, entry);
  }

  static create() {
    return new CacheOperator(InMemoryCache.instance);
  }
}

module.exports = {
  CacheOperator,
}