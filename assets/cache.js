let cacheFunc = function () {
	this._cache = {}
	this.all=function(){return this._cache}
	this.get = function (key, func, expiration) {
		let res = this._cache[key]
		if (res == undefined) {
			res = func()
			this._cache[key] = res
			setTimeout(() => {
				this.del(key)
			}, expiration)
		}
		return res
	}
	this.set = function (key, val, expiration) {
		this._cache[key] = val
		setTimeout(() => {
			this.del(key)
		}, expiration)
	}
	this.del = function (key) {
		delete this._cache[key]
	}
	this.flush = function () {
		this._cache = {}
	}
	this.exists=function(key){
		return this._cache[key]
	}
}
module.exports = {
	Cache: cacheFunc
}