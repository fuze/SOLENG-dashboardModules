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


    var signedInList = response.members;

    function getOnCallList(signedInList) {
      var onCallList = [];
      for (i in signedInList) {
        if (signedInList[i].status == 2) {onCallList.push(signedInList[i])} //status '2' is 'busy' aka 'on a call'
      }
      return onCallList
    }

    displayValue = getOnCallList(signedInList).length;

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
