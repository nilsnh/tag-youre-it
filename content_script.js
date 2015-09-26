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
    if (selectedText == false) {
      return;
    } else {
      createPopover(document.activeElement, selectedText);
    }
  }

  function createPopover(element, content) {
    console.log('createPopover');

    $(document.activeElement).append('test');

    $(document.activeElement).popover({
      title: "Please select a semantic tag",
      content: 'say something',
      html: true,
      placement: 'auto'
    });

    $(document.activeElement).popover('show');
  }

  document.addEventListener('click', function(evt) {
    if (!document.hasFocus()) {
      return true;
    }
    processSelection();
    // evt.stopPropagation();
    // evt.preventDefault();
  }, false);

});