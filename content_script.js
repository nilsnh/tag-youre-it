$(document).ready(function () {

  function processSelection () {
    var focused = document.activeElement;
    var selectedText;
    if (focused) {
      try {
        selectedText = focused.value.substring(
            focused.selectionStart, focused.selectionEnd);
      } catch (err) {
      }
    }
    if (selectedText == undefined) {
      var sel = window.getSelection();
      var selectedText = sel.toString();
    }
    console.log(selectedText);
  }

  document.addEventListener('click', function(evt) {
    if (!document.hasFocus()) {
      return true;
    }
    processSelection();
    // evt.stopPropagation();
    // evt.preventDefault();
  }, false);

  // var popoverContent;

  // $.get('test-menu-content.html', function (data) {
  //   popoverContent = data;
  //   contentReady();
  // });

  // function contentReady () {
  //   $('.selected').popover({
  //     title: "Please select a semantic tag",

  //     content: popoverContent,

  //     html: true,

  //     placement: 'auto'

  //   });

  //   $('.selected').popover('show');
  // }
});