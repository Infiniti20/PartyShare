REM sqlite3 db/partyshare.db .schema > .schema

CALL tsc app/index.ts --noEmit
CALL node esbuild.config.js
CALL node lib/index.js