const { CacheEntry} = require('../cache/CacheEntry');
const _value = Symbol('value');

class GenericCacheEntry extends CacheEntry {
  constructor(value, validity) {
    super(validity);
    if (!value) {
      throw new Error('No value set!');
    }

    this[_value] = value;
  }

  get value() {
    return this[_value];
  }
}

module.exports = {
  GenericCacheEntry,
}