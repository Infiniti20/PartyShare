da.PHONY: run

run:
	# sqlite3 db/partyshare.db .schema > .schema

	# npx html-minifier --input-dir views --output-dir views --remove-comments --collapse-whitespace

	# npx css-minify -d views -o views

	# npx uglifyjs-folder views 

	node esbuild.config.js
	node lib/index.js