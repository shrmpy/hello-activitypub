//go:build example
// +build example

package main

import (
	_ "embed"
	"log"
	"net/http"
)

//go:embed webfinger.json
var webfingerJSON []byte

const (
	port         = ":8077"
	resourceAcct = "acct:myhandle@mastodon.example.com"
	resourceMail = "mailto:myhandle@mastodon.example.com"
	resourceSubd = "https://mastodon.example.com"
	resourceRoot = "https://mastodon.example.com/"
)

func main() {
	http.HandleFunc("/well-known/webfinger", wfingerHandler)
	http.HandleFunc("/.well-known/webfinger", wfingerHandler)

	log.Printf("Listening on %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

func wfingerHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/well-known/webfinger" &&
		r.URL.Path != "/.well-known/webfinger" {
		log.Printf("FAIL path, %s", r.URL.Path)
		http.NotFound(w, r)
		return
	}
	if r.Method != http.MethodGet {
		log.Printf("FAIL method, %s", r.Method)
		http.NotFound(w, r)
		return
	}
	resource := r.URL.Query().Get("resource")
	if resource == "" {
		log.Printf("FAIL resource, %s", r.URL.Query())
		http.Error(w, "The resource query parameter is missing", http.StatusBadRequest)
		return
	}
	if resource != resourceAcct &&
		resource != resourceMail &&
		resource != resourceRoot &&
		resource != resourceSubd {
		log.Printf("FAIL acct, %s", r.URL.Query())
		http.Error(w, "The resource acct is unknown", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/jrd+json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	//w.WriteHeader(http.StatusOK)

	log.Printf("RCV %s", r.URL.Path)
	w.Write(webfingerJSON)
}
