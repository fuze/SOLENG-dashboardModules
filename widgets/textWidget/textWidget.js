widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    if (data.text) {

	    $('.content', el).html(data.text);
      if (data.tint){
        $(el).parent().css("filter", "brightness("+ data.tint +")");
      }
    }
  }
};
