
build:
	mkdir -p netlify/functions
	mkdir -p dist
	go generate
	GOBIN=${PWD}/netlify/functions go install ./...
	astro build

