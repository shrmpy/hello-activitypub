// +build example

package main

import (
	_ "embed"
	"log"
	"net/http"
)

//go:embed actor.json
var actorJSON []byte

const (
	port = ":8079"
)

func main() {
	http.HandleFunc("/u/subfrom", actorHand)

	log.Printf("Listening on %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

func actorHand(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/u/subfrom" {
		log.Printf("FAIL path, %s", r.URL.Path)
		http.NotFound(w, r)
		return
	}
	if r.Method != http.MethodGet {
		log.Printf("FAIL method, %s", r.Method)
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	log.Printf("RCV %s", r.URL.Path)
	w.Write(actorJSON)
}
