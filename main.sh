#!/bin/bash

sqlite3 database/partyshare.db .schema > .schema

node esbuild.config.js
node --trace-warnings lib/index.js 
# > .log
