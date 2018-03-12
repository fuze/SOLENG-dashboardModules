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

    var unpausedList = getUnpaused(signedInList);

    var availableList = getAvailable(unpausedList);


    function getUnpaused(signedInList) {
      var unpaused = [];
      for (i in signedInList) {
        if (signedInList[i].paused == false) {unpaused.push(signedInList[i])}
      }
      return unpaused
    }

    function getAvailable(unpausedList) {
      var availableList = []
      for (i in unpausedList) {
          if (unpausedList[i].status == 1){availableList.push(unpausedList[i])};
      }
      return availableList
    }

    var displayValue = availableList.length

    $('.content', el).html(displayValue); //prints the table
    $('a', el).attr('href', 'https://data.fuze.com/queues/' + data.queue + '/summary')

    if (data.threshold && parseInt(displayValue)<=data.threshold) {
      $(el).parent().css("background-color", "$brand-danger");
      $('.content', el).css("color", "$brand-danger-content");
      $('.widget-title', el).css("color", "$brand-danger-title");
    } else {
      $(el).parent().css("background-color", "$widget-background-color");
      $('.content', el).css("color", "$widget-body-text-color");
    }


  }
};
