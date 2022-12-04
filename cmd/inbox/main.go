package main

import (
	////"encoding/json"
	"strings"
)
import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(handler)
}

func handler(ev events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	////buf, _ := json.Marshal()
	payload := formatPlaceholderJs()

	return events.APIGatewayProxyResponse {
		StatusCode: 200,
		Body: payload,
	}, nil
}

func formatPlaceholderJs() string {
	var js strings.Builder

	js.WriteString("{data:")
	js.WriteString("{test: 'this is inbox data'}")
	js.WriteString("}")

	return js.String()
}

