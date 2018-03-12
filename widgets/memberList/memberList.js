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
    // console.log(response)

    getUnpaused(signedInList, function (unpausedList){
      var availableList = []
      for (i in unpausedList) {
          if (unpausedList[i].status == 1){availableList.push(unpausedList[i]);}
      }


//      var displayValue = [["Signed in:   ", signedInList.length]];
//      displayValue.push(["Unpaused:   ", unpausedList.length]);
//      displayValue.push(["Available:   ", availableList.length]);

      var displayValue = [["Agent","Status","Calls"]]
      for (i in response.members){
        var thisMember = response.members[i]
        var values = [thisMember.name,translateStatus(thisMember.status),thisMember.callsTaken]
        if (values[1] == "Available" && thisMember.paused){values[1] = "Paused"}
        displayValue.push(values)
      }
      $('.content', el).html(displayTable(displayValue)); //prints the table
    });

    function translateStatus(value){
      var result
      if (value == 1){result = "Available"}
      else if (value == 2){result = "On a Call"}
      else if (value == 3){result = "Busy"}
      else if (value == 4){result = "Invaild"}
      else if (value == 5){result = "Unavailable"}
      else if (value == 6 || value == 7){result = "Ringing"}
      else if (value == 8){result = "On Hold"}
      else {result = "Other"}
      return (result)
    }

    function displayTable(values){
      var table = "<table class=\"memberList\" border=\"0\" cellpadding=\"5\" width=\"100%\">";
      for (row in values) {
        var memberStatus = values[row][1]
        var pausedStatus = values[row][2]
        if (memberStatus == "On a Call"){table += "<tr class=\"inUse\">"}
        else if (memberStatus == "Paused"){table += "<tr class=\"paused\">"}
        else if (memberStatus == "Available"){table += "<tr class=\"available\">"}
        else if (memberStatus == "Ringing"){table += "<tr class=\"ringing\">"}
        else {table += "<tr>"}

        for (column in values[row]) {
            table += "<td><div align=\"left\">" + values[row][column] + "</div></td>";
        }

        table += "</tr>";
      }
      table += "</table>";
      return table;
    }

    function getUnpaused(signedIn, getAvailable) {
      var unpaused = [];
      for (i in signedIn) {
        if (signedIn[i].paused == false) {unpaused.push(signedIn[i]);}
      }
    return getAvailable(unpaused)
    }

  }
};
