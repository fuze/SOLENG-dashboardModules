widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    $('a', el).attr('href', 'https://data.fuze.com/queues/' + data.queue + '/summary')

    var waitTime = parseInt(data.response.longestholdtime)
      //The parameters our job passed through are in the data object
      //el is our widget element, so our actions should all be relative to that
    if (data.title) {
  	  $('h2', el).text(data.title);
      }

    if (waitTime > 0){
      useTimer(increment, 1000) //since we dont get new data on hold time every second, let's fake it by incrementing
    } else {
      //if we have no wait time, clear the timer
      var windowData = windowDataInit()
      clearInterval(windowData.myInterval)
    }

    function windowDataInit() { //returns this widget's window object. if one doent exist, it creates it first
      widgetUID = ($(el).parent().data("row") +  "-" + $(el).parent().data("col")) //creates a unique widget ID based on its grid coordinates
      if (!window[widgetUID]) {
        window[widgetUID] = {}
      }
     return (window[widgetUID])
    }

    function useTimer(callback, interval) {
      var windowData = windowDataInit()
      if (windowData.myInterval) {
        clearInterval(windowData.myInterval)
      }
      windowData.myInterval = setInterval(callback, interval)
    }

    function increment() {
      waitTime++;
      convertHR(waitTime, displayData);
    }
    convertHR(waitTime, displayData);

    function convertHR(time,callback) {
      var result;
      if (time < 60){ //check if we need to turn seconds into minutes:seconds
        result = time;
      } else {
        waitMins = Math.floor(time / 60); //get the minutes
        waitSecs = String((time % 60));  //get seconds
        if (waitSecs.length < 2) {waitSecs = "0" + waitSecs} //if we have a single digit number of seconds, pad the front with a "0"
        result = waitMins + ":" + waitSecs;
      }
      callback(result,time);
    }


    function displayData(displayValue,waitTime) {
    if (data.threshold && parseInt(displayValue)>=data.threshold) {
      $(el).parent().addClass("warning");
      $(el).addClass("warning");
    } else {
      $(el).parent().removeClass("warning");
      $(el).removeClass("warning");
      if (data.tint){
        $(el).parent().css("filter", "brightness("+ data.tint +")");
      }
    }
      $('.content', el).html(displayValue);
    }
  }
};
