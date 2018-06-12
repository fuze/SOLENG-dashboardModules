const _cache = Symbol('cache');
const _gatherKeysToDelete = Symbol('gatherKeysToDel');
const _map = Symbol('map');
const _purgeTimeout = Symbol('purgeTimeout');
const _purgeOperationID = Symbol('purgeOperationID');
const _restartPurge = Symbol('restartPurge');
const _stopPurge = Symbol('stopPurge');
const _schedulePurge = Symbol('schedulePurge');

const purgeExecutionInterval = 1000 * 60 * 60;

class CacheDestroyer {
  constructor(cache, purgeTimeout = purgeExecutionInterval) {
    this[_cache] = cache;
    this[_map] = this[_cache].getAll();
    this[_purgeTimeout] = purgeTimeout;

    this[_gatherKeysToDelete] = function() {
      const toDelKeys = [];
      
      for (let [key] of this[_map]) {
        if (!this[_map].get(key).stillValid()) {
          toDelKeys.push(key);
        }
      }

      return toDelKeys;
    }

    this[_schedulePurge] = () => {
      this[_purgeOperationID] = setInterval(() => this.purge(), this[_purgeTimeout]);
    }

    this[_restartPurge] = function() {
      this[_stopPurge]();
      this[_schedulePurge]();
    }

    this[_stopPurge] = () => {
      clearInterval(this[_purgeOperationID]);
      this[_purgeOperationID] = undefined;
    }

    this[_schedulePurge]();
  }

  get purgeTimeout() {
    return this[_purgeTimeout];
  }

  set purgeTimeout(purgeTimeout) {
    this[_purgeTimeout] = purgeTimeout;
    this[_restartPurge]();
  }

  purge() {
    const toDelKeys = this[_gatherKeysToDelete]();
    toDelKeys.forEach(keyToDel => this[_map].delete(keyToDel));
  }
}

module.exports = {
  CacheDestroyer,
}