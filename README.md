# tag-youre-it
A chrome extension for tagging words with semantic information.

## Development

1. To do active development, just [download this plugin](https://github.com/nilsnh/tag-youre-it/archive/master.zip).
2. You'll need to have installed [node.js](https://nodejs.org/en/).
3. Go inside the unzipped folder and run `npm install && npm install -g gulp`. In addition to installing development dependencies it will also install Gulp which is useful for active development.
4. Run `gulp serve` to serve up the prototype for live development.
5. Run `gulp dist` to build the chrome plugin in the `dist/` folder.

## Chrome testing

1. Inside chrome go to `settings -> Extensions`.
2. Select `Load unpacked extension` and select the project's `dist/` folder.
3. You should now see a new browser icon. Go to a page and start tagging.
4. In case of error: Press "f12" and have a look at the console log output.

**Important** A [workaround for CORS](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-app-launcher-info-dialog) is currently needed to communicate with the server.

## What's happening under the hood?

Technology stack (roughly): Angular.js, Typescript, Lodash and Rangy.js.

*How is the plugin loaded?* `Manifest.json` defines add an icon and a background page called `background.js`. The background page adds a click listener to the plugin's browser icon. When triggered it will first load jquery and then inject the menu in an iframe as well as create an iframe for the page content. It will then continue loading dependencies before finally calling `tagit.init()` on the plugin which to make angular initialize itself making it possible to interact with the menu. When loading the plugin will check local storage for previously made tags and add them the page. The plugin will also add click listeners to the iframe(s) containing content to be tagged. 

*How does tagging happen?* After the plugin has been loaded it will have added click listeners to the iframe(s) containing the taggable content. When a click happens it will check if a word was selected. If a new word had been selected it will query a backend for possible definitions to tag the word with. When the user selects a definition the plugin tags the word, saves the tag and posts the result back to the backend. 

*Particularities to tagging:* When tagging a selection the plugin must always relate the tag position to the original DOM object (original web page structure). Thus the plugin will remove all tags and selections before saving a word selection or saving a tag. Tags also need to be loaded in a bottom up order so that their `range.startOffset` is always in relation to the original DOM. `StartOffset` is simply a position number of where the node (html element etc.) is located within the DOM tree-structure that starts with 0 (document root). 

*More particularities to tagging:* When a word is selected `rangy.js` adds invisible selection markers (spans) to the page which safeguards against accidentally unselecting the word we are trying to tag or accidentally tagging the wrong word. The selection markers will be removed when loading the selection again (making the right word selected in blue on the page). After loading the selection we tag the word by wrapping it in a span that contains tagging information and style information which highlights the tagged word. A button element is also added inside the span for removing the tag. 
