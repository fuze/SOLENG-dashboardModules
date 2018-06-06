const cacheProp = Symbol('cache');
const validityProp = Symbol('validity');
const gatherKeysToDelete = Symbol('gatherKeysToDel');
const singleton = Symbol();
const singletonEnforcer = Symbol();

const purgeExecutionInterval = 1000 * 60 * 60;

class InMemoryCache {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot construct a singleton object');
    }

    this[cacheProp] = new Map();

    this[gatherKeysToDelete] = function() {
      const toDelKeys = [];
      for (let [key, value] of this[cacheProp]) {
        if (!this[cacheProp].get(key).stillValid()) {
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
    toDelKeys.forEach(keyToDel => this[cacheProp].delete(keyToDel));
  }
}

module.exports = {
  InMemoryCache,
}
 