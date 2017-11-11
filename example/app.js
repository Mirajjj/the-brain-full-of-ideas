(function() {
  var canvas = $('#canvas')
  var resize = function () {
    $(canvas).width($(window).width());
    $(canvas).height($(window).height());
  };

  resize();

  $(window).resize(resize);

  const events = {
    onHover: function () {
      console.log(1)
    },
    onHoverOut: function () {
      console.log(2)
    }
  }

  new window.brain(canvas[0], 'example/brain-component/assets', events)
})()