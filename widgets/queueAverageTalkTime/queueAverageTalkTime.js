widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    $("a[href^='https://data.fuze.com/queues/']").each(function() {
      this.href = 'https://data.fuze.com/queues/' + data.queue + '?after=now-0d&before=now';
    })

    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    let totalDuration = 0
    let completeCalls = 0

    response.queueCalls.forEach(function(call){
      if (call.connectedTime){
        totalDuration += call.connectedTime //sum the durration of all calls
        completeCalls += 1 //count calls while we are at it.
      }
    })
    let averageTalkTime
    if (completeCalls > 0){
      averageTalkTime = Math.round((totalDuration / 1000) / completeCalls) //conver to seconds and do the average calculation
    } else {
      averageTalkTime = 0
    }

    var displayValue = convertTime(averageTalkTime) //get a human readable string of minutes and seconds

    $('.content', el).html(displayValue); //prints the value

    if (data.threshold && parseInt(averageTalkTime)>=data.threshold) {
      $(el).parent().addClass("warning");
      $(el).addClass("warning");
    } else {
      $(el).parent().removeClass("warning");
      $(el).removeClass("warning");
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
        waitSecs = String((time % 60));  //get seconds
        if (waitSecs.length < 2) {waitSecs = "0" + waitSecs} //if we have a single digit number of seconds, pad the front with a "0"
        result = waitMins + ":" + waitSecs;
      }
      return (result)
    }
  }
};
