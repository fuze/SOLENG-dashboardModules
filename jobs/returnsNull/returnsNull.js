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
  onRun: function (config, dependencies, jobCallback) {
    jobCallback(null, config); //simply sends the config to the widget
  }
};