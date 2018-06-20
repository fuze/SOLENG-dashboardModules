module.exports = {
  onInit: function (config, dependencies) {
  },

  onRun: function (config, dependencies, jobCallback) {
    var logger = dependencies.logger;
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
        variable: config.variable,
        tint: config.tint, 
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

        let username = config.globalAuth[config.authName].username
        let password = config.globalAuth[authName].password
        let queueList
        if (typeof config.queue === 'string'){ //alows for single queue configs to work
          queueList = [config.queue]
        } else {
          queueList = config.queue
        }
        let fullResponse = makeAllRequests(queueList)
        try {
          fullResponse.then(function(result){
            global.cachedWallboardResponses = responseCache.cacheResponse(jobConfig, global.cachedWallboardResponses, result)
            jobCallback(null, {title: config.widgetTitle, variable: config.variable, tint: config.tint, queue: config.queue, response: result, threshold: config.threshold});
          })
        } catch (err) {
          nullResponse(err)
        }

        
      }catch(err){
        nullResponse(err)
      }
    }

    function makeAllRequests(queueList) {
      return new Promise(async function(resolve, reject) {
        const promises = [];
        queueList.forEach((queue) => {
          promises.push(createRequestPromise(queue));
        });
        try {
          const results = await Promise.all(promises);
          resolve(combineResponses(results));
        } catch (e) {
          reject(e);
        }
      });
    }

    function createRequestPromise(queue) {
      let baseURL = "https://synapse.thinkingphones.com/tpn-webapi-broker/services/queues/$QUEUE/status"
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

    async function combineResponses (responseList) {
      try {
        var combinedResponse = {} // init values
        combinedResponse.callsWaiting = 0
        combinedResponse.numAbandoned = 0
        combinedResponse.numCompleted = 0
        combinedResponse.serviceLevelPerf = 0
        combinedResponse.avgHoldTime = 0
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
        
        if (combinedResponse.numCompleted > 0){
          combinedResponse.avgHoldTime = (combinedResponse.avgHoldTime/combinedResponse.numCompleted)
          combinedResponse.serviceLevelPerf = (combinedResponse.serviceLevelPerf/combinedResponse.numCompleted)
        } else {
          combinedResponse.avgHoldTime = 0
          combinedResponse.serviceLevelPerf = 0
        }

        combinedResponse.maxWaiting = Math.max.apply(null, maxWaitingArray) //get largest value in array

        combinedResponse.members = combineMembers(memberList) //combine the queue memeber lists
        combinedResponse.members = await getPeerNames(combinedResponse.members)

        return (combinedResponse);
      }catch(err){
        console.log(err)
        jobCallback(err, null)
      }
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
    async function getPeerNames(members){
      const getPeerOwner = require("../util/synapse/peerOwner.js").getCachedPeerOwner;
      var peerList = []
      for (i in members){ //pull the peer names from the member list to give to PeerOwner
        peerList.push(members[i].name)
      }
      credentials = {
        user: config.globalAuth[config.authName].username,
        pass: config.globalAuth[config.authName].password,
        tenant: config.tenant
      }
        const peerOwners = await getPeerOwner(credentials, peerList);
        members.forEach(member => translate(member, peerOwners));
        return members
    }

    function translate(member, peerOwners) {
      const memberName = member.name.substring(4).toLowerCase();
      const peerInfo = peerOwners.find(peerOwner => peerOwner.peer === memberName);
      member.name = peerInfo ? peerInfo.displayName : member.name;
    }

    function nullResponse (err){
      console.log("Job did not complete successfully")
      if(err){console.log(err)}
      jobCallback(err, {title: config.widgetTitle, response: {'members': []}, threshold: config.threshold});
    }  
  }
};
