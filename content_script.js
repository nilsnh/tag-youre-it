$(document).ready(function () {
  console.log('hello world!');

  $("body").append('<button type="button" class="btn btn-lg btn-danger" data-toggle="popover" title="Popover title" data-content="And heres some amazing content. Its very engaging. Right?">Click to toggle popover</button>');

  $('[data-toggle="popover"]').popover();
});

