REM sqlite3 database/partyshare.db .schema > .schema

REM tsc app/index.ts --noEmit
CALL node esbuild.config.js
cls
CALL node --trace-warnings lib/index.js 
REM > .log
