widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    let totalTime = 0
    for (i in response.queueCalls){
      totalTime += (response.queueCalls[i].queueTime / 1000)
    }
    let averageTime = totalTime / response.queueCalls.length
    var displayValue = convertTime(Math.round(averageTime));

    $('.content', el).html(displayValue); //prints the value

    if (data.threshold && parseInt(averageTime)>=data.threshold) {
      $(el).parent().css("background-color", "#FF0000");
      $('.content', el).css("color", "#181818");
      $('.widget-title', el).css("color", "#454545");
    } else {
      $(el).parent().css("background-color", "#181818");
      $('.content', el).css("color", "#9b9b9b");
    }
    
    function convertTime(time) {
      var result;
      if (time < 60){ //check if we need to turn seconds into minutes:seconds
        result = time;
      } else {
        waitMins = Math.floor(time / 60); //get the minutes
        waitSecs = String(time % 60);  //get seconds
        if (waitSecs.length < 2) {waitSecs = "0" + waitSecs} //if we have a single digit number of seconds, pad the front with a "0"
        result = waitMins + ":" + waitSecs;
      }
      return (result)
    }

  }
};
