#!/bin/sh

# Called by package.json see package.json.

# Remove old zip
rm dist.zip || true

# Remove script/link tags used for local development
# to avoid unecessary plugin errors when published
sed -i '' 's#.*/node_modules.*##g' dist/menu.tpl.html

# zip and ship!
zip -r dist.zip dist
