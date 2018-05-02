const userProp = new Symbol('username');
const tokenProp = new Symbol('token');
const timestampProp = new Symbol('timestamp');
const validityProp = new Symbol('validity');

const defaultValidity = 1000 * 60 * 60 * 24 * 7 * 30;
 
export default class AuthCacheEntry {
  constructor(username, token, validity = defaultValidity) {
    if (!username || !token) throw new Error ('No username or token set!');

    this[userProp] = username;
    this[tokenProp] = token;
    this[validityProp] = validity;
  }

  get username() {
    return this[userProp];
  }

  get token() {
    return this[tokenProp];
  }

  set timestamp (timestamp) {
    if (typeof timestamp !== 'Number') {
      throw new Error('Invalid timestamp provided');
    }

    this[timestampProp] = timestamp;
  }

  get timestamp() {
    if (!this[timestampProp]) {
      throw new Error('No timestamp set yet.');
    }

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