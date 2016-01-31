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

**How is the plugin loaded?** `Manifest.json` adds an icon and defines an [event page](https://developer.chrome.com/extensions/event_pages) called `background.js`. The event page adds a click listener to the plugin's browser icon. When triggered it will first load jquery and then inject the html menu in an iframe as well as create an iframe for housing the page content. The plugin is in fact reloading the page inside an iframe on the page. It will then continue loading dependencies before finally calling `tagit.init()` on the plugin which makes angular initialize itself making it possible to interact with the injected menu. When loading the plugin will check local storage for previously made tags and add them the page. The plugin will also add click listeners to the iframe(s) containing content to be tagged. 

**Why iframes?** I originally tried just injecting the menu into the page to tag. This was the source of a number of issues.  Tags need to be related to the original page structure but was disturbed by the injected non-static plugin menu. CSS was also quite unmanageable as the original page css would disturb the plugin menu and vice versa. In really bad cases the content to be tagged would seep out of its containing `<div></div>` element and overlap the plugin menu. All things considered iframes seem like a decent approach since they shield our menu and the taggable content from each other. 

**How does tagging happen?** After the plugin has been loaded it will have added click listeners to the iframe(s) containing the taggable content. When a click is registered the plugin will check if a word was selected. If a new word had been selected it will query a backend service (url endpoint) for possible definitions to tag the word with. When the user selects a definition the plugin tags the word, saves the tag in localstorage and posts the result back to the backend service. 

**Particularities to tagging:** When tagging a selection the plugin must always relate the tag position to the original DOM object (original web page structure). Thus the plugin will remove all tags and selections before saving a word selection or saving a tag. Tags also need to be loaded in a bottom up order so that their `range.startOffset` is always in relation to the original DOM. `StartOffset` is simply a position number of where the node (html element etc.) is located within the DOM tree-structure that starts with 0 (document root). 

**Even more particularities to tagging:** When a word is selected `rangy.js` adds invisible selection markers (spans) to the page which safeguards against accidentally unselecting the word we are trying to tag or accidentally tagging the wrong word. The selection markers will be removed when loading the selection again (making the right word selected in blue on the page). After loading the selection we tag the word by wrapping it in a span that contains tagging information and style information which highlights the tagged word. A button element is also added inside the span for removing the tag. 
