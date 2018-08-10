module.exports = {

  onInit: function (config, dependencies) {
  },
  onRun: async function (config, dependencies, jobCallback) {
    var logger = dependencies.logger;
    let jobConfig = { 
      "job": "queueSummary",
      "interval": config.interval,
      "queue": config.queue,
      "authName": config.authName
    }

    const responseCache = require("../util/responseCache.js")
    if(global.cachedWallboardResponses === undefined) { global.cachedWallboardResponses = [] } // init global.cachedWallboardResponses
    let cachedResponse = responseCache.checkCache(jobConfig, global.cachedWallboardResponses, config.interval) //check if we have a cahced response
    if (cachedResponse){ //use cached response
      jobCallback(null, {
        response: cachedResponse, 
        title: config.widgetTitle,
        variable: config.variable,
        queue: config.queue, 
        threshold: config.threshold
      })
    }else{ //no cached response found

      try {
        let authName = config.authName
        if (!config.globalAuth || !config.globalAuth[authName] ||
          !config.globalAuth[authName].username || !config.globalAuth[authName].password){
          throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
        }

        let queueList
        if (typeof config.queue === 'string'){ //alows for single queue configs to work
          queueList = [config.queue]
        } else {
          queueList = config.queue
        }
        const fullResponse = makeAllRequests(queueList)
          await fullResponse.then(function(result){
            global.cachedWallboardResponses = responseCache.cacheResponse(jobConfig, global.cachedWallboardResponses, result)
            jobCallback(null, {title: config.widgetTitle, variable: config.variable, tint: config.tint, queue: config.queue, response: result, threshold: config.threshold});
          }).catch((err)=>{
            throw err
          })
      } catch (err) {
        console.log(err)
        jobCallback(err,null)
      }
    }

    function makeAllRequests(queueList) {
      return new Promise(async function(resolve, reject) {
        const promises = [];
        queueList.forEach((queue) => {
          promises.push(createRequestPromise(queue));
        });
        try {
          const results = await Promise.all(promises).catch((err)=>{
            throw err
          });
          resolve(combineResponses(results));
        } catch (e) {
          reject(e);
        }
      });
    }

    function createRequestPromise(queue) {
      let baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/summary"
      return new Promise((resolve, reject) => {
        var options = {
          url : baseURL.replace("$QUEUE", queue),
          headers : {"username" : config.globalAuth[config.authName].username, "password" : config.globalAuth[config.authName].password}
        }
        dependencies.easyRequest.JSON(options, function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    }

    function combineResponses (responseList) {
      var combinedResponse = {}  //init values
      try {
        combinedResponse.longestholdtime = 0

        for (i in responseList) {
          if (combinedResponse.longestholdtime < responseList[i].longestholdtime) {
            combinedResponse.longestholdtime = responseList[i].longestholdtime
          }
        }
        return (combinedResponse)
      } catch (err){
        console.log(err)
        jobCallback(err,null)
      }
    }

  }
};
