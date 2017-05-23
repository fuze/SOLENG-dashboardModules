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

     This is an example of how to make an HTTP call to google using the easyRequest dependency,
     and send the result to the registered widgets.
     Have a look at test/queueSummary for an example of how to unit tests this easily by mocking easyRequest calls

     */
    var baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/status"
    var responseList = []
    for (var i=0 in config.queue) {
      var options = {
        url : baseURL.replace("$QUEUE", config.queue[i]),
        headers : {"username" : config.username, "password" : config.password}
      }
      dependencies.easyRequest.JSON(options, function (err, response) {
        responseList.push(response)
        if (responseList.length == config.queue.length) { 
          combineResponses(responseList)
        }
      });
    }

    function combineResponses (responseList) {
      var combinedResponse = {} // init values
      combinedResponse.callsWaiting = 0
      combinedResponse.numAbandoned = 0
      combinedResponse.numCompleted = 0
      combinedResponse.serviceLevelPerf = 0
      var maxWaitingArray = []
      var memberList = []

      for (var i=0; i<responseList.length; i++) {
        combinedResponse.callsWaiting += responseList[i].callsWaiting //get sum values
        combinedResponse.numAbandoned += responseList[i].numAbandoned
        combinedResponse.numCompleted += responseList[i].numCompleted

        combinedResponse.serviceLevelPerf += (responseList[i].numCompleted * responseList[i].serviceLevelPerf) //do weighted averages
        combinedResponse.avgHoldTime += (responseList[i].numCompleted * responseList[i].avgHoldTime)

        maxWaitingArray.push(responseList[i].maxWaiting)
        memberList.push(responseList[i].members)
      }
      combinedResponse.serviceLevelPerf = (combinedResponse.serviceLevelPerf/combinedResponse.numCompleted) 
      combinedResponse.avgHoldTime = (combinedResponse.avgHoldTime/combinedResponse.numCompleted)
      combinedResponse.maxWaiting = Math.max.apply(null, maxWaitingArray) //get largest value in array

      combinedResponse.members = combineMembers(memberList) //combine the queue memeber lists

      jobCallback(null, {title: config.widgetTitle, response: combinedResponse, threshold: config.threshold}); //send response to widget
    }

    function combineMembers (memberList) {
      var result = []

      for (i=0; i<memberList.length; i++) { //loop through the list of member lists
        for (m=0; m<memberList[i].length; m++) { //loop through the peers in an individual member list
          var thisPeer = memberList[i][m].name
          var exists = -1
          for (n=0; n<result.length; n++) {
            if (result[n].name == thisPeer) {exists = n}
          }
          if (exists == -1) {
            var memberObject = {callsTaken: memberList[i][m].callsTaken,
                                status: memberList[i][m].status,
                                name: memberList[i][m].name,
                                paused: memberList[i][m].paused
                               }
            result.push(memberObject)
          } else {
            //if any specail logic is needed for agents in multiple queues, it goes here.
            //result[exists].callsTake+=memberList[i][m].callsTaken
          }
        }
      }
      return result
    }

  }
};
