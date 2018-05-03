/**
 * Job: userCallStats
 *
 * Expected configuration:
 *
 * { 
 *   myconfigKey : [ 
 *     { username : 'portal.username',
 *       password : 'portal.password',
 *       tennant : 'tennantCode' }
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

    const logger = dependencies.logger;
    const request = dependencies.easyRequest;

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
    const jobConfig = { 
      "job": "callData",
      "interval": config.interval,
      "tenant": config.tenant,
      "authName": config.authName,
      "timeRange": config.timeRange,
      "department": config.department
    }
    const responseCache = require("../util/responseCache.js");

    if (global.cachedWallboardResponses === undefined) {
      global.cachedWallboardResponses = [] 
    }

    const cachedResponse =
      responseCache.checkCache(jobConfig, global.cachedWallboardResponses, config.interval);

    if (cachedResponse) { //use cached response
      jobCallback(null, {
        response: cachedResponse, 
        title: config.widgetTitle, 
        pageSize: config.pageSize,
        sortValue: config.sortValue,
        ascending: config.ascending,
        displayColumns: config.displayColumns
      });
    } else { //no cached response found
      const authName = config.authName;
      if (
        !config.globalAuth ||
        !config.globalAuth[authName] ||
        !config.globalAuth[authName].username ||
        !config.globalAuth[authName].password ||
        !config.globalAuth[authName].appToken) {
        throw('no credentials found. Please check global authentication file (usually config.globalAuth)');
      }

      const username = config.globalAuth[authName].username;
      const password = config.globalAuth[authName].password;
      const appToken = config.globalAuth[authName].appToken;

      try {
        const wardenAuth = require("../util/auth/wardenNodeAuth.js").cachedWardenAuth;
        const userToken = await wardenAuth(appToken, username, password);

        getUserList(wardenToken, (userList) => {
          getCallData(wardenToken, (callData) => {
            try {
              for (call in callData.calls){
                addNameToCall(callData.calls[call],userList.users)
              }
              jobCallback(null, {title: config.widgetTitle, response: callData, pageSize: config.pageSize, sortValue: config.sortValue, ascending: config.ascending, displayColumns: config.displayColumns})
            } catch (err) {
              logger.error(err);
              jobCallback(err, null)
            }
          });
        });
      } catch (e) {
        logger.error(e);
      }    
    }


    function getUserList(wardenToken, callback){
      try {

        if (!wardenToken) {
          throw 'Error: no warden token';
        }

        const usersEndpointURL = "https://rest.data.fuze.com/users";
        if (typeof config.department != 'undefined') {
          usersEndpointURL += "?dept=" + config.department;
        }

        const options = {
          url: usersEndpointURL,
          headers : {
            Authorization: "Bearer " + wardenToken
          }
        };

        request.JSON(options, (err, response) => {
          if (!err){
            callback(response);
          } else {
            logger.error(err);
            callback(null);
          }
        });
      } catch (err){
        logger.error(err);
        callback(null);
      }
    }

    function getCallData(wardenToken, callback, max, storedResults, first){
      try {
        
        if (!wardenToken) {
          throw 'Error: no warden token';
        }

        if (!max){
          var max = 1000;
        }

        if (!storedResults) {
          var storedResults = [];
        }

        let startTime = getStartTime(config.timeRange);
        let endpointURL = "https://rest.data.fuze.com/calls?after=" + startTime +"&tk=" + config.tenant + "&limit=" + max;
        if (typeof config.department != 'undefined') {
          endpointURL += "&dept=" + config.department;
        }

        if (first) {
          endpointURL += "&first=" + first;
        }

        let options = {
          url: endpointURL,
          headers : {
            Authorization: "Bearer " + wardenToken
          }
        };

        request.JSON(options, (err, response) => {
          if (err){
            console.log(err);
            callback(null);
          } else {
            // if the results are shorter than the max, there are no more results to grab
            if (response.calls.length < max) {  
              if (typeof first != 'undefined') {
                // if we specified a first element, we will need to remove it from our results
                response.calls = response.calls.splice(1); 
              }
              
              Array.prototype.push.apply(storedResults, response.calls);
              callback({calls: storedResults});
            } else {
              if (typeof first != 'undefined') {
                //if we specified a first element, we will need to remove it from our results
                response.calls = response.calls.splice(1); 
              }
              Array.prototype.push.apply(storedResults, response.calls);
              //get the linkedId of the last call we got to use as the 'first'
              const lastId = response.calls[response.calls.length - 1].linkedId; 
              getCallData(wardenToken, callback, max, storedResults, lastId);
            }
          }
        })
      } catch (err) {
        logger.error(err);
        callback(null);
      }
    }

    function addNameToCall(call, listOfUsers){
      if (typeof call.to.userId == 'string') {
        const userObject = listOfUsers.find(user => user.userId == call.to.userId);
        if (typeof userObject != 'undefined') {
          call.to.firstName = userObject.firstName;
          call.to.lastName = userObject.lastName;
        }
      }
      if (typeof call.from.userId == 'string') {
        const userObject = listOfUsers.find(user => user.userId == call.to.userId);
        if (typeof userObject != 'undefined') {
          call.from.firstName = userObject.firstName;
          call.from.lastName = userObject.lastName;
        }
      }
    }
    
    function getStartTime(range) {
      if (range != "day" && range != "week" && range != "month") {
        throw "timeRange must either be 'day', 'week', 'month', '7d', or '30d'";
      }
      const startTime = new Date();
      startTime.setMinutes(0);
      startTime.setHours(0);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      if (range == "week") {
        startTime.setDate(startTime.getDate() - startTime.getDay());
      } else if (range == "month") {
        startTime.setDate(1);
      } else if (range == "7d") {
        startTime.setDate(startTime.getDate - 7);
      } else if (range == "30d") {
        startTime.setDate(startTime.getDate - 30);
      }
      
      return (startTime.toJSON());
    }
  }
};
