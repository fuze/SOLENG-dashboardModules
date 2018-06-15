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
    var displayValue = Math.round((response.numCompleted+response.numAbandoned)*((100-response.serviceLevelPerf)/100)); //get the number of calls outside SLA

    $('.content', el).html(displayValue); //prints the table

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

  }
};
