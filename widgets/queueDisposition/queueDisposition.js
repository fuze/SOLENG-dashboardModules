widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    let totalCalls = response.queueCalls.length
    let abandonedCalls = filterCalls("Abandon", response.queueCalls)
    let completeCalls = filterCalls("Complete", response.queueCalls)
    let exitEmptyCalls = filterCalls("ExitEmpty", response.queueCalls)
    let timeoutCalls = filterCalls("ExitWithTimeout", response.queueCalls)

    let table = "<table class=\"queueDisposition\" border=\"0\" cellpadding=\"3\" width=\"100%\">"
    table += "<tr class=\"Heading\">"
    table += "<td><div align=\"left\">Connected</div></td><td><div align=\"left\">Timeout</div></td><td><div align=\"left\">Abandoned</div></td><td><div align=\"left\">Empty</div></td>"
    table += "</tr>"
    table += "<tr class=\"Data\">"
    table += "<td><div align=\"left\">" + getValuePair(completeCalls.length,totalCalls) + "</div></td><td><div align=\"left\">" + getValuePair(timeoutCalls.length,totalCalls) + "</div></td><td><div align=\"left\">" + getValuePair(abandonedCalls.length,totalCalls) + "</div></td><td><div align=\"left\">" + getValuePair(exitEmptyCalls.length,totalCalls) + "</div></td>"
    table += "</table>"

    
    var displayValue = table


    $('.content', el).html(displayValue); //prints the value

    function filterCalls(disposition, calls){
      return calls.filter(function(thisCall){
        return (thisCall.disposition == disposition)
      })
    }
 
    function getValuePair (value,total){
    
      return ("" + value + " | " + Math.round(value/total*100) + "%")
    }
  }
};
