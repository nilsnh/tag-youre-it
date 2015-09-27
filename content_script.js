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
    if (selectedText) {
      console.log(selectedText);
    }
  }

  document.addEventListener('click', function(evt) {
    if (!document.hasFocus()) {
      return true;
    }
    processSelection();
    // evt.stopPropagation();
    // evt.preventDefault();
  }, false);

  /*
    Take the existing content, make it narrower and
    insert a menu for tagging up content.
  */
  var isMenuShown = false;

  function addMenu () {
    if (isMenuShown) return;
    $.get('example1.menu.html', function (htmlData) {
      $('body').children().wrapAll('<div class="tagit-body" />');
      $('.tagit-body').before(htmlData);
      $('#js-hide-menu').click(removeMenu);
      isMenuShown = true;
    });
  }
  function removeMenu () {
    if (!isMenuShown) return;
    $('.tagit-body').children().unwrap();
    $('.tagit-menu').remove();
    isMenuShown = false;
  }

  $('#js-show-menu').click(addMenu);

});