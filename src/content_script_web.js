// used for local web testing

@@include('content_script_include.js')

injectScripts(); //found in the included file

// will be called within a angular service
function storeTagData (tagData) {
  console.log('storeTagDataInBrowser was called');
}