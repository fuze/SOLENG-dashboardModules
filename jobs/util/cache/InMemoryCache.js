const _cacheProp = Symbol('cache');
const _singleton = Symbol();
const _singletonEnforcer = Symbol();
const _cacheDestroyer = Symbol('cacheDestroyer');

const { CacheDestroyer } = require('./CacheDestroyer');
 
class InMemoryCache {
  constructor(enforcer) {
    if (enforcer !== _singletonEnforcer) {
      throw new Error('Cannot construct a singleton object');
    }

    this[_cacheProp] = new Map();
  }

  static get instance() {
    if (!this[_singleton]) {
      this[_singleton] = new InMemoryCache(_singletonEnforcer);
      this[_cacheDestroyer] = new CacheDestroyer(this[_singleton]);
    }

    return this[_singleton];
  }

  getAll() {
    return this[_cacheProp];
  }

  get(key) {
    return this[_cacheProp].get(key);
  }

  set(key, value) {
    value.timestamp = new Date().getTime();
    this[_cacheProp].set(key, value);
  }
}

module.exports = {
  InMemoryCache,
}
 