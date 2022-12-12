
build:
	mkdir -p netlify/functions
	go get github.com/aws/aws-lambda-go/events
	go get github.com/aws/aws-lambda-go/lambda
	go get github.com/aws/aws-lambda-go/lambdacontext
	go get github.com/awslabs/aws-lambda-go-api-proxy/core
	go get github.com/fauna/faunadb-go/v4/faunadb
	go get github.com/awslabs/aws-lambda-go-api-proxy/httpadapter
	GOBIN=${PWD}/netlify/functions go install ./...
	astro build

