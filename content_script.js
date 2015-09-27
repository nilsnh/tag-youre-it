$(document).ready(function () {

  var isMenuShown = false;
  var currentlySelectedWord;

  // Find currently selected word
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
      currentlySelectedWord = selectedText;
      console.log(selectedText);
      queryServer(selectedText);
    } else {
      currentlySelectedWord = "";
    }
  }

  function queryServer (word) {
    var serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data={"word":"QUERYTOREPLACE"}'
    $.get(serverUrl.replace('QUERYTOREPLACE', word), function (serverResponse) {
      console.log(serverResponse);
      updateList(serverResponse);
    });

    function updateList (serverResponse) {
      var senses = serverResponse.senses;
      senses.reverse();
      var listTemplate = '<li id="SENSEID"><strong>WORD.</strong> EXPLANATION</li>'
      var htmlList = [];
      for (var i = senses.length - 1; i >= 0; i--) {
        htmlList.push(listTemplate
          .replace('SENSEID', senses[i].senseid)
          .replace('WORD', senses[i].word)
          .replace('EXPLANATION', senses[i].explanation))
      };

      htmlList = '<ul id="senses">' +
        htmlList.join('') +
        '</ul>';

      // debugger;

      $('#senses').replaceWith(htmlList);

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

  addMenu();

  // $('#js-show-menu').click(addMenu);

});