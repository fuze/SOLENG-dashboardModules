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


    var displayValue = convertTime(response.avgHoldTime)

    $('.content', el).html(displayValue); //prints the table

    if (data.threshold && parseInt(displayValue)>=data.threshold) {
      $(el).parent().css("background-color", "$brand-danger");
      $('.content', el).css("color", "$brand-danger-content");
      $('.widget-title', el).css("color", "$brand-danger-title");
    } else {
      $(el).parent().css("background-color", "$widget-background-color");
      $('.content', el).css("color", "$widget-body-text-color");
    }

  }
};
