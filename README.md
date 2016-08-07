# tag-youre-it
A chrome extension for tagging words with semantic information.

![Sample screenshot of the plugin in action](/screenshot1.png?raw=true)

## Development

What you need to do to get started developing this plugin. 

Prerequisites:

- Install [node.js](https://nodejs.org/). 

1. git clone this project.
1. Run `npm install` 
1. Run `npm start` to serve up the prototype for live development. To configure what browser is started please see the `npm start` command found in the package.json file.  

Please note: A [workaround for CORS](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-app-launcher-info-dialog) is needed for allowing the live development version to talk to the server.

## Chrome testing

1. Run `npm run build` to generate a dist/ folder.
1. Inside chrome go to `settings -> Extensions`.
1. Select `Load unpacked extension` and select the project's generated `dist/` folder.
1. You should now see a new browser icon. Go to a page and start tagging.
1. In case of error: Press "f12" and have a look at the console log output.

Please note: After loading the plugin you'll see that it has a extension id in Chrome's list of loaded Extensions. Ensure that the file `dist/menu.tpl.html` point to this extension id. More info here about [how the chrome plugin refers to files](https://developer.chrome.com/extensions/overview#relative-urls).  

## What's happening under the hood?

Technology stack (roughly): Jspm, Typings, Angular.js, Typescript, Lodash and Rangy.js.

**How is the plugin loaded?** `Manifest.json` adds an icon and defines an [event page](https://developer.chrome.com/extensions/event_pages) called `background.js`. The event page adds a click listener to the plugin's browser icon. When triggered it will first load jquery and then inject the html menu in an iframe as well as create an iframe for housing the page content. The plugin is in fact reloading the page inside an iframe on the page. It will then continue loading dependencies before finally calling `tagit.init()` on the plugin which makes angular initialize itself making it possible to interact with the injected menu. When loading the plugin it will check localstorage for previously made tags and add them to the page. The plugin will also add click listeners to the iframe(s) containing the content to be tagged. 

**Why iframes?** I originally tried to just inject the menu into the page to tag. This was the source of a number of issues.  Tags need to be related to the original page structure but was disturbed by the injected non-static plugin menu. CSS was also quite unmanageable as the original page's css would disturb the plugin menu and vice versa. In really bad cases the content to be tagged would seep out of its containing `<div></div>` element and overlap the plugin menu. All things considered iframes seem like a decent approach since they shield our menu and the taggable content from each other. 

**How does tagging happen?** After the plugin has been loaded it will have added click listeners to the iframe(s) containing the taggable content. When a click is registered the plugin will check if a word was selected. If a new word has been selected it will query a backend service (url endpoint) for possible definitions to tag the word with and display them in the menu. When the user selects a definition the plugin tags the word, saves the tag in localstorage and posts the result back to the backend service. 

**Particularities to tagging:** When tagging a selection the plugin must always relate the tag position to the original DOM object (original web page structure). Thus the plugin will remove all tags and selections before saving a word selection or saving a tag. Tags also need to be loaded in a bottom up order so that their `range.startOffset` is always in relation to the original DOM. `StartOffset` is simply a position number of where the node (html element etc.) is located within the DOM tree-structure that starts with 0 (document root). 

**Even more particularities to tagging:** When a word is selected `rangy.js` adds invisible selection markers (spans) to the page which safeguards against accidentally unselecting the word we are trying to tag or accidentally tagging the wrong word. The selection markers will be removed when loading the selection again (making the right word selected in blue on the page). After loading the selection we tag the word by wrapping it in a span that contains tagging information and style information which highlights the tagged word. A button element is also added inside the span for removing the tag. 

## Licensed under the MIT License

Copyright (c) 2016 Nils Norman Haukås

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

