widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    var signedInList = response.members;

    $('.content', el).html(makeProgressTable(getAgentLists(signedInList))); //prints the table

    function makeProgressTable(agents){
      var maxValue = Math.max(agents.total, response.callsWaiting) //the scale of the bar graph should be the number of signed in agents or the number of calls waiting, whichever is larger

      var dependencies = "" //you need these for bootstrap which is used for the progress bars
      dependencies += "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\">"
      dependencies += "<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\"></script>\n"

      var table = dependencies + ""
      table += "<div class=\"progress\">\n"
      var label = ""
      var percent
      if (agents.available.length){
        percent = agents.available.length/maxValue*100
        if (percent >= 35){label = "Available (" + agents.available.length + ")"}else{label = "(" + agents.available.length + ")"}
        table += "<div class=\"progress-bar progress-font progress-bar-success\" role=\"progressbar\" style=\"width:" + percent + "%\">" + label + "</div>\n"
      }
      if (agents.paused.length){
        percent = agents.paused.length/maxValue*100
        if (percent >= 35){label = "Paused (" + agents.paused.length + ")"}else{label = "(" + agents.paused.length + ")"}
        table += "<div class=\"progress-bar progress-font progress-bar-warning\" role=\"progressbar\" style=\"width:" + percent + "%\">" + label + "</div>\n"
      }
      if (agents.onCall.length) {
        percent = agents.onCall.length/maxValue*100
        if (percent >= 35){label = "On call (" + agents.onCall.length + ")"}else{label = "(" + agents.onCall.length + ")"}
        table += "<div class=\"progress-bar progress-font progress-bar-danger\" role=\"progressbar\" style=\"width:" + percent + "%\">" + label + "</div>\n"
      }
      table += "</div>"

      table += "<div class=\"progress\">\n"
      if (response.callsWaiting){
        percent = response.callsWaiting/maxValue*100
        if (percent >= 25){label = "Calls (" + response.callsWaiting + ")"}else{label = "(" + response.callsWaiting + ")"}
        table += "<div class=\"progress-bar progress-font progress-bar-striped active\" role=\"progressbar\" style=\"width:" + percent + "%\">" + label + "</div>\n"
      }
      table += "</div>"

      return table;
    }

    function getAgentLists(signedIn) { //sort the member list into statuses
      var agents = {}
      agents.total = signedIn.length
      agents.onCall = []
      agents.paused = []
      agents.available = []
      agents.other = []
      for (i in signedIn) {
        if (signedIn[i].status == 2){ //status 2 is "Device is in use"
          agents.onCall.push(signedIn[i])
        } else if (signedIn[i].paused == true) {
          agents.paused.push(signedIn[i])
        } else if (signedIn[i].status == 1){ //status 1 is "Device is not used" aka available (this check means weird device states like 'invaid' and 'ringing' are not included)
          agents.available.push(signedIn[i])
        } else { 
          agents.other.push(signedIn[i])
        }
      }
      return agents
    }

  }
};
