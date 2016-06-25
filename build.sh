#!/bin/sh

#bundle all javascript, including deps
jspm bundle-sfx src/app/main.ts dist/app.js

#copy styles
cp -v src/app/style.css dist/

#copy html menu
cp -v src/app/menu/menu.tpl.html dist/

#copy plugin specifics
cp -v src/plugin-specific/* dist/
