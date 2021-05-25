let cacheFunc=function() {
  this._cache = {}
  this.get = function(key,func) {
    let res = this._cache[key]
    if (res == undefined) {
      res=func()
			this._cache[key]=res
    }
		return res
  }
  this.set = function(key, val, expiration) {
    this._cache[key]=val
    setTimeout(() => {
      this.del(key)
    }, expiration)
  }
  this.del = function(key) {
    delete this._cache[key]
  }
  this.flush = function() {
    this._cache = {}
  }
}
module.exports={
  Cache:cacheFunc
}