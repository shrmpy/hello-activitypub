
build:
	mkdir -p netlify/functions
	GOBIN=${PWD}/netlify/functions go install ./...
	astro build

