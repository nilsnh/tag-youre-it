$(document).ready(function () {
  console.log('hello world!');

  var popoverContent;

  $.get('test-menu-content.html', function (data) {
    popoverContent = data;
    contentReady();
  });

  function contentReady () {
    $('.selected').popover({
      title: "Please select a semantic tag",

      content: popoverContent,

      html: true,

      placement: 'auto'

    });

    $('.selected').popover('show');
  }
});