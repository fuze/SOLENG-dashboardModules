widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }

    var displayValue = Math.round(response.serviceLevelPerf);

    //$('.content', el).html(displayValue + "%"); //prints the table
    $('.content', el).html(displayValue + " %"); //prints the table
    $('a', el).attr('href', 'https://data.fuze.com/queues/' + data.queue + '/summary')

    if (data.threshold && parseInt(displayValue)<=data.threshold) {
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
