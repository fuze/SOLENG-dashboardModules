const { CacheEntry } = require('../cache/CacheEntry');
const userProp = Symbol('username');
const tokenProp = Symbol('token');

class AuthCacheEntry extends CacheEntry {
  constructor(username, token, validity) {
    super(validity);

    if (!username || !token) throw new Error ('No username or token set!');

    this[userProp] = username;
    this[tokenProp] = token;
  }

  get username() {
    return this[userProp];
  }

  get token() {
    return this[tokenProp];
  }
}

module.exports = {
  AuthCacheEntry,
}