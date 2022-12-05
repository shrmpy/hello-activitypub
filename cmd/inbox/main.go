package main

import (
	"encoding/json"

	"log"
	"net/http"
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
	switch ev.HTTPMethod {
	case http.MethodPost:
		return consumePostRequest(ev)
	case http.MethodGet:
		return consumeGetRequest(ev)
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "Method not ready",
		}, nil

	}
}

func consumePostRequest(ev events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	//TODO incoming follow, accept requests
	//     (create, delete)

	req, err := extractRequestFields(ev.Body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "JSON contains extra",
		}, nil
	}

	if req.ActivityType != "Follow" &&
		req.ActivityType != "Accept" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "Activity type not implemented",
		}, nil
	}

	logActivity("REQPOST", ev.Headers, ev.Body)

	//TODO send Accept reply
	return events.APIGatewayProxyResponse {
		StatusCode: http.StatusOK,
		Body: formatPlaceholderJs(),
	}, nil
}
func consumeGetRequest(ev events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	//TODO incoming 

	logActivity("REQGET", ev.Headers, ev.Body)

	//TODO send reply
	return events.APIGatewayProxyResponse {
		StatusCode: http.StatusOK,
		Body: formatPlaceholderJs(),
	}, nil
}

func formatPlaceholderJs() string {
	var js strings.Builder
	js.WriteString(`{"data": {"test": "tbd"}}`)

	return js.String()
}

func extractRequestFields(body string) (followRequest, error) {
	var req followRequest
	// rehydrate structured from request body json 
	err := json.Unmarshal([]byte(body), &req)
	if err != nil {
		return followRequest{}, err
	}
	// todo may need to consider generics to help
	return req, nil
}

func logActivity(prefix string, a interface{}, body string) {
	//TODO capture to faunaDB
	// interim q&d is write logs which are handled by netlify
	buf, err := json.Marshal(a)
	if err != nil {
		log.Printf("%s: %v", prefix, err)
	}else{
		log.Printf("%s:%s; %s", prefix, string(buf), body)
	}
}

type followRequest struct {
	AtContext string `json:"@context"`
	Id string `json:"id"`
	ActivityType string `json:"type"`
	Actor string `json:"actor"`
	Object string `json:"object"`
}

type acceptResponse struct {
	AtContext string `json:"@context"`
	Id string `json:"id"`
	ActivityType string `json:"type"`
	Actor string `json:"actor"`
	Object string `json:"object"`
}

