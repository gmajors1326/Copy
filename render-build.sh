#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Install Chrome to the location specified in .puppeteerrc.cjs
npx puppeteer browsers install chrome
