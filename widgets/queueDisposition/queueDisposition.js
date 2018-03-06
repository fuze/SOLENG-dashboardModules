widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    var response = data.response //gets response from the job
    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }

    let thisVariable = 0;
    switch(data.variable) {
      case 'totalCalls':
        thisVariable = response.queueCalls.length
        break;
      case 'abandon':
        thisVariable = filterCalls("Abandon", response.queueCalls).length
        break;
      case 'complete':
        thisVariable = filterCalls("Complete", response.queueCalls).length
        break;
      case 'exitEmpty':
        thisVariable = filterCalls("ExitEmpty", response.queueCalls).length
        break;
      case 'exitTimeout':
        thisVariable = filterCalls("ExitWithTimeout", response.queueCalls).length
        break;
      case 'optOut':
        thisVariable = filterCalls("OptOut", response.queueCalls).length
        break;
      case 'Transfer':
        thisVariable = filterCalls("Transfer", response.queueCalls).length
        break;
      default:
        thisVariable = 'Undefined'
    }

    var displayValue = thisVariable

    
    $('.content', el).html(displayValue); //prints the value
    $('a', el).attr('href', 'https://data.fuze.com/queues/' + data.queue + '/summary'); //set the link URL

    function filterCalls(disposition, calls){
      return calls.filter(function(thisCall){
        return (thisCall.disposition == disposition)
      })
    }
  }
};
