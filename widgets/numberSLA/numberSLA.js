widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    console.log(response)
    var displayValue = Math.round((response.numCompleted+response.numAbandoned)*((100-response.serviceLevelPerf)/100)); //get the number of calls outside SLA

    $('.content', el).html(displayValue); //prints the table

    if (data.threshold && displayValue>=data.threshold) {
      $(el).parent().css("background-color", "#FF0000");
      $('.content', el).css("color", "#181818");
      $('.widget-title', el).css("color", "#454545");
    } else {
      $(el).parent().css("background-color", "#181818");
      $('.content', el).css("color", "#9b9b9b");
    }

    
  }
};
