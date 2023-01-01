//go:build example
// +build example

package main

import (
	////_ "embed"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

const (
	port = ":8078"
)

func main() {
	http.HandleFunc("/api/inbox", followingHand)

	log.Printf("Listening on %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

// Prior to this event, we initiate a subscribe request to the publisher.
// Then they reply with Accept or Reject to our inbox which triggers this handler.
func followingHand(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/inbox" {
		logAct("ERR", nil, r.URL.Path)
		http.NotFound(w, r)
		return
	}
	if r.Method != http.MethodPost {
		logAct("ERR", nil, r.Method)
		http.NotFound(w, r)
		return
	}
	sig, ok := r.Header["Signature"]
	if !ok {
		logAct("ERR", nil, r.URL.String())
		http.Error(w, "The signature is missing", http.StatusBadRequest)
		return
	}
	logAct("SIG", sig, "")
	// TODO verify the signature
	ct, ok := r.Header["Content-Type"]
	if !ok {
		logAct("ERR", nil, r.URL.String())
		http.Error(w, "The content-type is unknown", http.StatusBadRequest)
		return
	}
	bag, err := rehydrate(ct, r.Body)
	if err != nil {
		logAct("ERR", r, "")
		http.Error(w, "The JSON is not recognized", http.StatusBadRequest)
		return
	}
	act, ok := bag["type"]
	if !ok {
		logAct("ERR", bag, "Absent property")
		http.Error(w, "The activity is missing a type property", http.StatusBadRequest)
		return
	}
	switch act {
	case "Reject":
		// add the rejected to debugging/log
		logAct("REJ", bag, "")
	case "Undo":
		// add the undo to debugging/log
		logAct("UND", bag, "")
	case "Remove":
		// add the remove to debugging/log
		logAct("RMV", bag, "")
	case "Delete":
		// add the delete to debugging/log
		logAct("DEL", bag, "")

	case "Accept":
		// add the accepted to debugging/log
		logAct("ACC", bag, "")
	case "Follow":
		// add the follow to debugging/log
		// check signature to match follower to signer
		// then reply with accept
		logAct("FLW", bag, "")
	case "Create":
		// add the create to debugging/log
		logAct("CRT", bag, "")
	}

	w.WriteHeader(http.StatusOK)
}

func rehydrate(ct []string, rd io.Reader) (map[string]interface{}, error) {
	//if ct != "application/json" {
	if len(ct) != 0 && !strings.Contains(ct[0], "json") {
		return nil, errors.New("Expected json content")
	}
	var data map[string]interface{}
	buf, err := ioutil.ReadAll(rd)
	if err != nil {
		return data, err
	}
	// rehydrate structured from request body json
	err = json.Unmarshal(buf, &data)
	if err != nil {
		return data, err
	}
	return data, nil
}

func logAct(prefix string, a interface{}, body string) {
	//todo minimal logger
	if a == nil {
		log.Printf("%s:%s", prefix, body)
		return
	}
	log.Printf("%s:%v; %s", prefix, a, body)
}

type activityBag struct {
	AtContext    string `json:"@context"`
	Id           string `json:"id"`
	ActivityType string `json:"type"`
	Actor        string `json:"actor"`
	Object       string `json:"object"`
}
