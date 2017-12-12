/**
 * Job: queueSummary
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
    try {
      let authName = config.authName
      if (!config.globalAuth || !config.globalAuth[authName] ||
        !config.globalAuth[authName].username || !config.globalAuth[authName].password){
        throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
      }

      let username = config.globalAuth[authName].username
      let password = config.globalAuth[authName].password
      var baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/summary"
      var responseList = []
      for (i in config.queue) {
        var options = {
          url : baseURL.replace("$QUEUE", config.queue[i]),
          headers : {"username" : username, "password" : password}
        }
        dependencies.easyRequest.JSON(options, function (err, response) {
          try{
            responseList.push(response)
            if (responseList.length == config.queue.length) {
              combineResponses(null, responseList)
            }
          } catch (err){
            combinedResponses(err, null)
          }
        });
      }
    } catch (err) {
      console.log(err)
      jobCallback(err, null)
    }

    function combineResponses (err, responseList) {
      var combinedResponse = {}  //init values
        try {
          if(err){throw err}
          combinedResponse.longestholdtime = 0

          for (i in responseList) {
            if (combinedResponse.longestholdtime < responseList[i].longestholdtime) {
              combinedResponse.longestholdtime = responseList[i].longestholdtime
            }
          }
          jobCallback(null, {title: config.widgetTitle, queue: config.queue, response: combinedResponse, threshold: config.threshold});
        } catch (err){
          console.log(err)
          jobCallback(err,null)
        }
      });
    }
  }
};
