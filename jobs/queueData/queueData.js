/**
 * Job: userCallStats
 *
 * Expected configuration:
 *
 * {
 *   myconfigKey : [
 *     { username : 'portal.username',
 *       password : 'portal.password',
 *       tennant : 'tennantCode',
 *       timeRange: 'month' //also accepted 'week', otherwise will return results for today
 *   ]
 * }
 */

module.exports = {

  /**
   * Executed on job initialisation (only once)
   * @param config
   * @param dependencies
   */
  onInit: function (config, dependencies) {

    /*
    This is a good place for initialisation logic, like registering routes in express:

    dependencies.logger.info('adding routes...');
    dependencies.app.route("/jobs/mycustomroute")
        .get(function (req, res) {
          res.end('So something useful here');
        });
    */
  },

  /**
   * Executed every interval
   * @param config
   * @param dependencies
   * @param jobCallback
   */
  onRun: async function (config, dependencies, jobCallback) {

    /*
     1. USE OF JOB DEPENDENCIES

     You can use a few handy dependencies in your job:

     - dependencies.easyRequest : a wrapper on top of the "request" module
     - dependencies.request : the popular http request module itself
     - dependencies.logger : atlasboard logger interface

     Check them all out: https://bitbucket.org/atlassian/atlasboard/raw/master/lib/job-dependencies/?at=master

     */

    var logger = dependencies.logger;

    /*

     2. CONFIGURATION CHECK

     You probably want to check that the right configuration has been passed to the job.
     It is a good idea to cover this with unit tests as well (see test/queueSummary file)

     Checking for the right configuration could be something like this:

     if (!config.myrequiredConfig) {
     return jobCallback('missing configuration properties!');
     }


     3. SENDING DATA BACK TO THE WIDGET

     You can send data back to the widget anytime (ex: if you are hooked into a real-time data stream and
     don't want to depend on the jobCallback triggered by the scheduler to push data to widgets)

     jobWorker.pushUpdate({data: { title: config.widgetTitle, html: 'loading...' }}); // on Atlasboard > 1.0


     4. USE OF JOB_CALLBACK

     Using nodejs callback standard conventions, you should return an error or null (if success)
     as the first parameter, and the widget's data as the second parameter.

     */

    let queueName    = config.queue;
    let tenant       = config.tenant;
    let authName = config.authName

    let jobConfig = {
      "job": "queueData",
      "interval": config.interval,
      "queue": config.queue,
      "tenant": config.tenant,
      "authName": config.authName
    }
     
    const responseCache = require("../util/responseCache.js")
    if(global.cachedWallboardResponses === undefined) { global.cachedWallboardResponses = [] } //init global.cachedWallboardResponses
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
      if (!config.globalAuth || !config.globalAuth[authName] ||
        !config.globalAuth[authName].username || !config.globalAuth[authName].password || !config.globalAuth[authName].appToken){
        throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
      }

      let username = config.globalAuth[authName].username
      let password = config.globalAuth[authName].password
      const appToken = config.globalAuth[authName].appToken
      if (typeof config.queue === 'string'){ //alows for single queue configs to work
        queueList = [config.queue]
      } else {
        queueList = config.queue
      }
      try {
        const wardenAuth = require("../util/auth/wardenNodeAuth.js").cachedWardenAuth;
        const wardenToken = await wardenAuth(appToken, username, password);

        let fullResponse = {queueCalls: await makeAllRequests(wardenToken, queueList)}

        global.cachedWallboardResponses = responseCache.cacheResponse(jobConfig, global.cachedWallboardResponses, fullResponse)
        let response = {title: config.widgetTitle, queue: config.queue, response: fullResponse, threshold: config.threshold, variable: config.variable, };
        jobCallback(null, response);

      } catch (e) {
        console.log(e)
        logger.error(e);
      }
    }

    function makeAllRequests(wardenToken, queueList){
      return new Promise(async function(resolve, reject) {
        const promises = [];
        queueList.forEach((queue) => {
          promises.push(callDataPromise(wardenToken, queue));
        });
        try {
          const results = await Promise.all(promises);
          resolve([].concat.apply([], results)); //combine results' array of arrays into a single array
        } catch (e) {
          reject(e);
        }

      });
    }

    function callDataPromise (wardenToken, queue){
      return new Promise((resolve, reject) => {
        getCallData (wardenToken, queue, (err, callData) => {
          if (err){reject(err)}
          else {resolve(callData)}
        });
      });
    }

    function getCallData (wardenToken, queueName, callback, max, storedResults, first){
      try {
        if (!wardenToken){
          throw 'Error: no warden token'
        }
        if (!max){var max=1000}
        if (!storedResults){var storedResults=[]}
        let startTime = getStartTime(config.timeRange)
        let endpointURL = "https://rest.data.fuze.com/queueCalls?after=" + startTime +"&tk=" + tenant + "&limit=" + max
        if (queueName){
          endpointURL += "&queue=" + queueName //if a queue is specified in the config, use it in the request. Otherwise, defaults to all
        }
        if (first){
          endpointURL += "&first=" + first
        }
        let options = {
          url: endpointURL,
          headers : {
            Authorization: "Bearer " + wardenToken
          }
        }
        dependencies.easyRequest.JSON(options, (err, response) => {
          if (err){
            console.log(err)
            callback(err, null)
          } else {
            try {
              if (response.queueCalls.length < max){  //if the results are shorter than the max, there are no more results to grab
                if (typeof first != 'undefined'){
                  response.queueCalls = response.queueCalls.splice(1) //if we specified a first element, we will need to remove it from our results
                }
                Array.prototype.push.apply(storedResults, response.queueCalls)
                callback(null, storedResults)
              } else {
                if (typeof first != 'undefined'){
                  response.queueCalls = response.queueCalls.splice(1) //if we specified a first element, we will need to remove it from our results
                }
                Array.prototype.push.apply(storedResults, response.queueCalls)
                let lastId = response.queueCalls[response.queueCalls.length-1].id //get the id of the last call we got to use as the 'first'
                getCallData(wardenToken, queueName, callback, max, storedResults, lastId)
              }
            } catch (err) {
              console.log(err)
              callback(err, null)
            }
          }
        })
      } catch (err) {
        console.log(err)
        callback(err, null)
      }
    }

    function getStartTime(range){
      if (range != "day" && range != "week" && range != "month"){
        throw "timeRange must either be 'day', 'week', 'month', '7d', or '30d'"
      }
      let startTime = new Date()
      startTime.setMinutes(0)
      startTime.setHours(0)
      startTime.setSeconds(0)
      startTime.setMilliseconds(0)
      if (range == "week") {
        startTime.setDate(startTime.getDate()-startTime.getDay())
      } else if (range == "month"){
        startTime.setDate(1)
      } else if (range == "7d"){
        startTime.setDate(startTime.getDate-7)
      } else if (range == "30d"){
        startTime.setDate(startTime.getDate-30)
      }

      return (startTime.toJSON())
    }
  }
  
};
