const AuthCacheEntry = require('./AuthCacheEntry').default;
const cacheProp = new Symbol('cache');
const validityProp = new Symbol('validity');
const gatherKeysToDelete = new Symbol('gatherKeysToDel');
const singleton = new Symbol();
const singletonEnforcer = new Symbol();

const purgeExecutionInterval = 1000 * 60 * 60;

export default class InMemoryCache {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot construct a singleton object');
    }

    this[cacheProp] = new Map();

    this[gatherKeysToDelete] = function() {
      const toDelKeys = [];
      for (let [key, value] of this[cacheProps]) {
        if (!this[cacheProps][key].stillValid()) {
          toDelKeys.push(key);
        }
      }
      return toDelKeys;
    }

    setInterval(() => {
      this.purge();
    }, purgeExecutionInterval);
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new InMemoryCache(singletonEnforcer);
    }

    return this[singleton];
  }

  get(key) {
    return this[cacheProp].get(key);
  }

  set(key, value) {
    value.timestamp = new Date().getTime();
    this[cacheProp].set(key, value);
  }

  purge() {
    const toDelKeys = this[gatherKeysToDelete]();
    toDelKeys.forEach(keyToDel => this[cacheProps].delete(keyToDel));
  }
}
 