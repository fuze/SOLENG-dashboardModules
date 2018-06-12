const _cache = Symbol('cache');
const _gatherKeysToDelete = Symbol('gatherKeysToDel');

const purgeExecutionInterval = 1000 * 60 * 60;

class CacheDestroyer {
  constructor(cache) {
    this[_cache] = cache;

    this[_gatherKeysToDelete] = function() {
      const toDelKeys = [];
      for (let [key] of this[_cache]) {
        if (!this[_cache].get(key).stillValid()) {
          toDelKeys.push(key);
        }
      }

      return toDelKeys;
    }

    setInterval(() => this.purge(), purgeExecutionInterval);
  }

  purge() {
    const toDelKeys = this[_gatherKeysToDelete]();
    toDelKeys.forEach(keyToDel => this[_cache].delete(keyToDel));
  }
}

module.exports = {
  CacheDestroyer,
}