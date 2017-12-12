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
  onRun: function (config, dependencies, jobCallback) {

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

     /* See if this is the first time */
     let path = require('path');
     let jobName      = path.basename(__filename);
     let widgetTitle  = config.widgetTitle;
     let thisVariable = config.variable;
     let queueName    = config.queue;
     let tenant       = config.tenant;
     let fullResponse = {};

     fullResponse.title     = config.widgetTitle;
     fullResponse.variable  = config.variable;
     fullResponse.queue     = config.queue;
     fullResponse.response  = {};
     fullResponse.threshold = config.threshold;

     if(global.wallboardJobs === undefined) { global.wallboardJobs = {}; } // init global.wallboardJobs
     if(global.wallboardJobs[tenant] === undefined) { global.wallboardJobs[tenant] = {}; }
     if(global.wallboardJobs[tenant][queueName] === undefined) { global.wallboardJobs[tenant][queueName] = {}; }

     if(global.wallboardJobs[tenant][queueName][jobName] === undefined){
       global.wallboardJobs[tenant][queueName][jobName] = {};
       global.wallboardJobs[tenant][queueName][jobName].firstWidget = widgetTitle;
       global.wallboardJobs[tenant][queueName][jobName].response = {};
     } //  Initing done

    let firstWidget = global.wallboardJobs[tenant][queueName][jobName].firstWidget;

     if(widgetTitle != global.wallboardJobs[tenant][queueName][jobName].firstWidget) {
       fullResponse.response = global.wallboardJobs[tenant][queueName][jobName].response;
       jobCallback(null, fullResponse);
     } else {
      let authName = config.authName
      if (!config.globalAuth || !config.globalAuth[authName] ||
        !config.globalAuth[authName].username || !config.globalAuth[authName].password){
        throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
      }

      let username = config.globalAuth[authName].username
      let password = config.globalAuth[authName].password

      getToken(username, password, (wardenToken) => {
        getCallData(wardenToken, (callData) => {
          try {
            global.wallboardJobs[tenant][queueName][jobName].response = {}
            global.wallboardJobs[tenant][queueName][jobName].response = callData;
            fullResponse.response = callData;
            jobCallback(null, fullResponse);
          } catch (err) {
            console.error('error:');
            console.error(err);
            jobCallback(err, null);
          }
        });
      });

      function getToken(username, password, callback){
        if(global[tenant] && global[tenant].wardenToken !== undefined){
          callback(global[tenant].wardenToken);
        } else {
          try{
            const wardenAuth = require("./fuzeUtil/wardenNodeAuth.js").wardenAuth
            const appToken = "2.M9G01Num4hZ08KQ.YXBwbGljYXRpb246dmh5NE5MMUU4UToyMU5VUk5Cd2NQ"
            wardenAuth(appToken, username, password, (response) => {
              let wardenToken = response.data.grant.token
              global[tenant] = {}
              global[tenant].wardenToken = wardenToken
              callback(wardenToken)
            });
          } catch(err) {
            console.log(err)
            callback(null)
          }
        }
      }

      function getCallData (wardenToken, callback, max, storedResults, first){
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
              callback(null)
            } else {
              try {
                if (response.queueCalls.length < max){  //if the results are shorter than the max, there are no more results to grab
                  if (typeof first != 'undefined'){
                    response.queueCalls = response.queueCalls.splice(1) //if we specified a first element, we will need to remove it from our results
                  }
                  Array.prototype.push.apply(storedResults, response.queueCalls)
                  callback({queueCalls: storedResults})
                } else {
                  if (typeof first != 'undefined'){
                    response.queueCalls = response.queueCalls.splice(1) //if we specified a first element, we will need to remove it from our results
                  }
                  Array.prototype.push.apply(storedResults, response.queueCalls)
                  let lastId = response.queueCalls[response.queueCalls.length-1].id //get the id of the last call we got to use as the 'first'
                  getCallData(wardenToken, callback, max, storedResults, lastId)
                }
              } catch (err) {
                console.log(err)
                callback(null)
              }
            }
          })
        } catch (err) {
          console.log(err)
          callback(null)
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
  }
};