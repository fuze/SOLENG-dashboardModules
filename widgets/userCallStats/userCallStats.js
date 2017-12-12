widget = {
  //config.direction: "in", "out" (optional)
  
  //runs when we receive data from the job
  onData: function (el, data) {
    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    
    let callList = data.response.calls
    let sortedCalls = sortCallsToUsers(callList)
    let userList = []
    for (i in sortedCalls){
      userList.push(getMetadata(sortedCalls[i]))
    }
    userList = sortList(userList, data.sortValue, data.ascending)
    
    const pageSize = data.pageSize //number of users who fit on a page
    userList = paginateData(userList, pageSize) //only present the users who appear on this page
    let displayValue = displayTable(userList)
    $('.content', el).html(displayValue); //prints the table
    
    function sortCallsToUsers(callList){
      let userCalls = {}
      for (i in callList){
        let thisCall = callList[i]        
        if (thisCall.from.userId){ //checks if the call originated from a Portal user
          initCallList(userCalls, thisCall.from.userId, {firstName: thisCall.from.firstName, lastName: thisCall.from.lastName})
          userCalls[thisCall.from.userId].calls.push(thisCall)
        }
        if (thisCall.to.userId){ //checks if the call terminated to a Portal user
          initCallList(userCalls, thisCall.to.userId, {firstName: thisCall.to.firstName, lastName: thisCall.to.lastName})
          userCalls[thisCall.to.userId].calls.push(thisCall)
        }
      }
      return (userCalls)
    }
    
    function initCallList (userCalls, user, name){
      if (typeof userCalls[user] == 'undefined'){
        userCalls[user] = {'firstName': name.firstName, 'lastName': name.lastName, 'calls': []}
      }
    }
    
    function getMetadata(userCalls){
      userCalls.totalCalls = userCalls.calls.length
      userCalls.averageTalkTime = formatTime(getAverageTalkTime(userCalls.calls))
      userCalls.inbound = userCalls.calls.filter(function(call){return(call.direction == "Inbound")}).length
      userCalls.outbound = userCalls.calls.filter(function(call){return(call.direction == "Outbound")}).length
      userCalls.internal = userCalls.calls.filter(function(call){return(call.direction == "Internal")}).length
      userCalls.platform = userCalls.calls.filter(function(call){return(call.direction == "Platform")}).length
      return (userCalls)
    }
    
    function getAverageTalkTime(callList){
      let totalTime = 0
      for (thisCall in callList){
        totalTime += getCallTime(callList[thisCall])
      }
      return (totalTime/callList.length)
    }
    
    function getCallTime(call){
      let startTime = new Date(call.startedAt)
      let endTime = new Date(call.endedAt)
      let calltime = Math.round((endTime - startTime) / 1000)
      return (calltime)  //returns call durration in seconds 
    }
    
    function stripZeros(data){
      let result = data.filter(function(user){ 
        return (user.totalCalls > 0)
      })
      return (result)
    }

    function sortList(data,key,ascending){
      data.sort(function(a, b){
        if (ascending == true){
          if (a[key] > b[key]){
            return (1)
          } else if (a[key] < b[key]) {
            return (-1)
          } else {
            return (0)
          }
        } else {
          if (a[key] < b[key]){
            return (1)
          } else if (a[key] > b[key]) {
            return (-1)
          } else {
            return (0)
          }

        }
      })
      return (data)
    }
    
    function windowDataInit() { //returns this widget's window object. if one doent exist, it creates it first
      widgetUID = ($(el).parent().data("row") +  "-" + $(el).parent().data("col")) //creates a unique widget ID based on its grid coordinates
      if (!window[widgetUID]) {
        window[widgetUID] = {}
      }
     return (window[widgetUID])
    }

    function paginateData(data,pageSize){
      //figure out what page number we are on
      let windowData = windowDataInit()
      if (typeof windowData.currentPage == "undefined" || windowData.currentPage * pageSize >= data.length){ //if the current page is undefined, or too large, set it to 0
        windowData.currentPage = 0
      }
      let startIndex = windowData.currentPage * pageSize //array index to start on
      let endIndex = startIndex + pageSize //array index to end on

      windowData.currentPage += 1
      return (data.slice(startIndex, endIndex))
    }

    function formatTime(time) {
      time = Math.round(time)
      let hours = padZeros(String(Math.floor(time / 3600))); //get the hours
      let minutes = padZeros(String(Math.floor((time % 3600) / 60))); //get the minutes
      let seconds = padZeros(String(time % 60));  //get seconds
      let result = hours + ":" + minutes + ":" + seconds;
      return (result)
    }
    
    function padZeros(value){
      if (value.length < 2){
        value = "0" + value
      }
      return value
    }

    function displayTable(values){
      var table = "<table class=\"memberList\" border=\"0\" cellpadding=\"5\" width=\"100%\">";
      table += "<tr><td>Name</td><td>Total Calls</td><td>Inbound</td><td>Outbound</td><td>Internal</td><td>Platform</td><td>Avg Talk Time</td></tr>"
      for (i in values) {
        table += "<tr>"
        table += addTableData(values[i].firstName + " " + values[i].lastName)
        table += addTableData(values[i].totalCalls)
        table += addTableData(values[i].inbound)
        table += addTableData(values[i].outbound)
        table += addTableData(values[i].internal)
        table += addTableData(values[i].platform)
        table += addTableData(values[i].averageTalkTime)
        table += "</tr>";
      }
      table += "</table>";
      return table;
    }
    
    function addTableData(string){
      return("<td><div align=\"left\">" + string + "</div></td>")
    }
    
  }
};