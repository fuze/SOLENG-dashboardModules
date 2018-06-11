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
      $(el).parent().addClass("warning");
      $(el).addClass("warning");
    } else {
      if (data.tint){
        $(el).parent().css("filter", "brightness("+ data.tint +")");
      }
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
