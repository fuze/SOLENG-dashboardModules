widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
  	console.log(data)
    if (data.image) {
    	let imagePath = "/widgets/resources?resource=Fuze/Assets/" + data.image
	    $('#widgetImage', el).attr("src", imagePath);
      if (data.backgroundColor){
        $(el).parent().css("background-color", data.backgroundColor);
      }

    }
  }
};
