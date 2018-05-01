var exports  = module.exports = {}

exports.checkCache = checkCache
exports.cacheResponse = cacheResponse

function checkCache(config, cacheArray, interval){
	let foundIndex = findEquivalent(config, cacheArray)
	if (foundIndex != null){ //if we found a cache that uses the same config
		let equivalentCache = cacheArray[foundIndex]
		if (checkIfStale(equivalentCache.updatedTime, interval) == true){ //if the cached response is too old
			return(null) //cached response too old
		} else {
			return (equivalentCache.response) //return the response we have stored
		}
	} else {
		return (null) //no cached response found
	}
}

function findEquivalent(config, cacheArray){
	let foundCache = null 
	for (var i = 0; i < cacheArray.length; i++){
		if (isEquivalent(config,cacheArray[i].config) == true){
			foundCache = i
			break
		}
	}
	return (foundCache)
}

function isEquivalent(a, b) {
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
      if (JSON.stringify(a[propName]) !== JSON.stringify(b[propName])) {
        return false;
      }
  }
  return true;
}

function checkIfStale(updatedTime,interval){
	return (getTimeStamp() - updatedTime >= interval)
}

function getTimeStamp(){
	//return(Math.round((new Date()).getTime() / 1000))
	return((new Date()).getTime())
}

function cacheResponse(config, cacheArray, response){
	let cacheObject = {}
	cacheObject.response = response
	cacheObject.updatedTime = getTimeStamp()
	cacheObject.config = config

	let foundIndex = findEquivalent(config, cacheArray)
	if (foundIndex != null){ //when caching, if we already have a listing for this job, replace the old value
		cacheArray[foundIndex] = cacheObject
	} else { //otherwise, add this job/response to the list
		cacheArray.push(cacheObject)
	}
	return (cacheArray)
}