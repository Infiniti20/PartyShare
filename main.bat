REM sqlite3 database/partyshare.db .schema > .schema

CALL node esbuild.config.js
CALL node --trace-warnings lib/index.js 
REM > .log
