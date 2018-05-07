const validityProp = Symbol('validity');
const timestampProp = Symbol('timestamp');
const defaultValidity = 1000 * 60 * 60 * 24 * 7 * 30;

class CacheEntry {
  constructor(validity = defaultValidity) {
    this[validityProp] = validity;
  }

  set timestamp (timestamp) {
    if (typeof timestamp !== 'number') {
      throw new Error('Invalid timestamp provided');
    }
    
    this[timestampProp] = timestamp;
  }
    
  get timestamp() {
    return this[timestampProp];
  }
    
  get validity() {
    return this[validityProp];
  }
    
  stillValid() {
    const expireTimestamp = (new Date().getTime() - this[validityProp]);
    return this[timestampProp] > expireTimestamp;
  }    
}

module.exports = {
  CacheEntry,
}