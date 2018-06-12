const _cache = Symbol('cache');
const _gatherKeysToDelete = Symbol('gatherKeysToDel');
const _map = Symbol('map');

// const purgeExecutionInterval = 1000 * 60 * 60;
const purgeExecutionInterval = 1000 * 60;

class CacheDestroyer {
  constructor(cache) {
    this[_cache] = cache;

    this[_map] = this[_cache].getAll();

    this[_gatherKeysToDelete] = function() {
      const toDelKeys = [];
      
      for (let [key] of this[_map]) {
        if (!map.get(key).stillValid()) {
          toDelKeys.push(key);
        }
      }

      return toDelKeys;
    }

    setInterval(() => this.purge(), purgeExecutionInterval);
  }

  purge() {
    console.log('purging...');
    const toDelKeys = this[_gatherKeysToDelete]();
    console.log(toDelKeys);
    toDelKeys.forEach(keyToDel => this[_map].delete(keyToDel));
  }
}

module.exports = {
  CacheDestroyer,
}