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
      try {
        let authName = config.authName
        if (!config.globalAuth || !config.globalAuth[authName] ||
          !config.globalAuth[authName].username || !config.globalAuth[authName].password){
          throw('no credentials found. Please check global authentication file (usually config.globalAuth)')
        }

        let username = config.globalAuth[authName].username
        let password = config.globalAuth[authName].password

        baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/summary"
        var options = {
          url : baseURL.replace("$QUEUE", config.queue),
          headers : {"username" : username, "password" : password}
        }
        dependencies.easyRequest.JSON(options, function (err, response) {
          global.wallboardJobs[tenant][queueName][jobName].response = {}
          global.wallboardJobs[tenant][queueName][jobName].response = response;
          fullResponse.response = response;
          jobCallback(null, fullResponse);
        });
      } catch (err) {
        console.log(err)
        jobCallback(err,null)
      }
    }
  }
};
