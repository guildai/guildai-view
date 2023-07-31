.PHONY: build

build: node_modules
	npm run build

node_modules:
	npm i

start:
	BROWSER=none npm start

copy-pub:
	git checkout-index -af --prefix=../guild-view-pub/ && rm ../guild-view-pub/NOTES.md || true
