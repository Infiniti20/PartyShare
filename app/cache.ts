interface Cache {
  [key: string]: any;
}
const defaultCacheExpiration = 900000;
class CacheLayer {
  _cache: Cache = {};
  all() {
    return this._cache;
  }

  get(
    key: string,
    func: Function,
    expiration: number = defaultCacheExpiration
  ) {
    let val = this._cache[key];
    if (val == undefined) {
      val = func();
      this.set(key, val, expiration);
    }
    return val;
  }

  async getAsync(
    key: string,
    func: Function,
    expiration: number = defaultCacheExpiration
  ) {
    let val = this._cache[key];
    if (val == undefined) {
      val = func();
      this.set(key, val, expiration);
    }
    return val;
  }

  set(key: string, val: any, expiration: number) {
    this._cache[key] = val;
    setTimeout(() => {
      this.del(key);
    }, expiration);
  }

  del(key: string) {
    delete this._cache[key];
  }

  flush() {
    this._cache = {};
  }

  exists(key: string) {
    return this._cache[key] != undefined;
  }
}

export { CacheLayer };
