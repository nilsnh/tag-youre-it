# tag-youre-it
A chrome extension for tagging words with semantic information.

## Development

1. To try it out, just [download this plugin](https://github.com/nilsnh/tag-youre-it/archive/master.zip).
2. You'll need to have installed [node.js](https://nodejs.org/en/).
3. Go inside the unzipped folder and run `npm install && npm install -g gulp`. In addition to installing development dependencies it will also install Gulp which is useful for active development.
4. ~~Run `gulp serve` to serve up the prototype for live development.~~ In need of a bugfix.
5. Run `gulp dist` to build the chrome plugin in the `dist/` folder.

## Chrome testing

1. Inside chrome go to `settings -> Extensions`.
2. Select `Load unpacked extension` and select the project's `dist/` folder.
3. You should now see a new browser icon. Go to a page and start tagging.
4. In case of error: Press "f12" and have a look at the console log output.

**Important** A [workaround for CORS](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-app-launcher-info-dialog) is currently needed to communicate with the server.
