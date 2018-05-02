/**
 * Job: queueStatus
 *
 * Expected configuration:
 *
 * ## PLEASE ADD AN EXAMPLE CONFIGURATION FOR YOUR JOB HERE
 * { 
 *   myconfigKey : [ 
 *     { serverUrl : 'localhost' } 
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

    //define the config values that effect the job
    //this is used to determine if we can reuse the response from another instance of this job running
    let jobConfig = { 
      "job": "queueStatusName",
      "interval": config.interval,
      "queue": config.queue,
      "tenant": config.tenant,
      "authName": config.authName
    }

    const responseCache = require("../util/responseCache.js")
    if(global.cachedWallboardResponses === undefined) { global.cachedWallboardResponses = [] } // init global.cachedWallboardResponses
    let cachedResponse = responseCache.checkCache(jobConfig, global.cachedWallboardResponses, config.interval) //check if we have a cahced response
    if (cachedResponse){ //use cached response
      jobCallback(null, {
        response: cachedResponse, 
        title: config.widgetTitle, 
        queue: config.queue, 
        threshold: config.threshold
      })
    }else{ //no cached response found
      try{
        let authName = config.authName
        if (!config.globalAuth || !config.globalAuth[authName] ||
          !config.globalAuth[authName].username || !config.globalAuth[authName].password){
          throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
        }

        let username = config.globalAuth[authName].username
        let password = config.globalAuth[authName].password

        const getPeerOwner = require("../util/peerOwner.js").getPeerOwner

        baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/status"
        var options = {
          url : baseURL.replace("$QUEUE", config.queue),
          headers : {"username" : username, "password" : password}
        }
        dependencies.easyRequest.JSON(options, function (err, response) {
          if (!err){
            var peerList = []
            for (i in response.members){ //pull the peer names from the member list to give to PeerOwner
              peerList.push(response.members[i].name)
            }
            credentials = {
              user: username,
              pass: password,
              tenant: config.tenant
            }
            if (peerList.length > 0){
              getPeerOwner(credentials, peerList, function(peerOwners){
                for (i in response.members){ //loop through the list of mebers to see if we found a matching name from peerOwners.
                  for (n in peerOwners){
                    if (response.members[i].name.substring(4).toLowerCase() == peerOwners[n].peer){ //if the name matches, replace it.
                      response.members[i].name = (peerOwners[n].displayName)
                    }
                  }
                }
                global.cachedWallboardResponses = responseCache.cacheResponse(jobConfig, global.cachedWallboardResponses, response)
                jobCallback(err, {title: config.widgetTitle, queue: config.queue, response: response, threshold: config.threshold});
              });
            } else {
              nullResponse("Error: Peer List is empty")
            }
          } else {
            nullResponse(err)
          }
        });
      }catch(err){
        nullResponse(err)
      }
    }

    function nullResponse (err){
      console.log("Job did not complete successfully")
      if(err){console.log(err)}
      jobCallback(err, {title: config.widgetTitle, response: {'members': []}, threshold: config.threshold});
    }  
  }
};
