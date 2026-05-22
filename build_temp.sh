#!/bin/bash
cd /home/theapiartist/work/agentsecrets-website
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v25.9.0 || nvm use default
npm run build
