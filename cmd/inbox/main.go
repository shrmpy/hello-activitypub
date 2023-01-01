package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
)
import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/shrmpy/hap"
)

func main() {
	lambda.Start(handler)
}

func handler(ev events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	logAct("RCV", ev.Headers, ev.Body)

	if ev.HTTPMethod != http.MethodPost {
		return errorResp("Method not implemented"), nil
	}

	sig, ok := ev.Headers["Signature"]
	if !ok {
		return errorResp("Signature not found"), nil
	}
	logAct("SIG", sig, "")

	// TODO verify the signature
	ct, ok := ev.Headers["Content-Type"]
	if !ok {
		return errorResp("Content-Type is unknown"), nil
	}

	bag, err := rehydrate(ct, ev.Body)
	if err != nil {
		return errorResp("JSON format"), nil
	}

	act, ok := bag["type"]
	if !ok {
		return errorResp("Activity type is required"), nil
	}

	switch act {
	case "Reject":
		logAct("REJ", bag, "")
	case "Undo":
		logAct("UND", bag, "")
	case "Remove":
		logAct("RMV", bag, "")
	case "Delete":
		logAct("DEL", bag, "")
	case "Accept":
		//logAct("ACC", bag, "")
		var debug = fmt.Sprintf("ACC - %v", bag)
		hap.Webhook(debug)
	case "Follow":
		// add the follow to debugging/log
		// check signature to match follower to signer
		// then reply with accept
		logAct("FLW", bag, "")
	case "Create":
		logAct("CRT", bag, "")
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       "",
	}, nil
}

func rehydrate(ct string, rd string) (map[string]interface{}, error) {
	if !strings.Contains(ct, "json") {
		return nil, errors.New("Expected json content")
	}
	var err error
	var data map[string]interface{}
	// rehydrate structured from request body json
	err = json.Unmarshal([]byte(rd), &data)
	if err != nil {
		return data, err
	}
	return data, nil
}

func errorResp(txt string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusInternalServerError,
		Body:       txt,
	}
}

func logAct(prefix string, a interface{}, body string) {
	if a == nil {
		log.Printf("%s - %s", prefix, body)
	} else {
		log.Printf("%s - %v; %s", prefix, a, body)
	}
}
