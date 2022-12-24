// +build example

package main

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"flag"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)
import "github.com/google/uuid"

const subscriberPublicKey = "https://honk.example.com/u/subfrom#main-key"
const subscriber = "https://honk.example.com/u/subfrom"
const baseId = "https://honk.example.com/"
const authorAddr = "https://mastodon.example.com/u/subto/inbox"
const author = "https://mastodon.example.com/u/subto"

func main() {
	conf, err := readArgs()
	if err != nil {
		log.Fatalf("FAIL config cannot initialize, %v", err)
	}

	var sub = newSubscribe(conf)

	var client = http.Client{Timeout: 30 * time.Second}

	res, err := client.Do(sub)
	if err != nil {
		log.Fatalf("FAIL post request, %v", err.Error)
	}
	log.Printf("Status %s", res.StatusCode)

	bod, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Fatalf("FAIL response, %v", err.Error)
	}
	log.Printf("Body, %s", bod)
}

// instantiate subscribe request
func newSubscribe(conf *argsCfg) *http.Request {
	var reqURL = publisher()
	var buf = topic()

	req, err := http.NewRequest(http.MethodPost, reqURL, bytes.NewReader(buf))
	if err != nil {
		log.Fatalf("FAIL new request, %v", err.Error)
	}

	req.Header.Set("Content-Type", "application/json")
	signature(conf.Private, req, buf)

	return req
}

// sign the covered parts
func signature(private *rsa.PrivateKey, req *http.Request, buf []byte) {
	// signature input string
	var i bytes.Buffer
	i.WriteString("(request-target): ")
	i.WriteString(strings.ToLower(req.Method))
	i.WriteString(" ")
	i.WriteString(req.URL.RequestURI())

	var broker = req.URL.Hostname()
	req.Header.Set("Host", broker)
	i.WriteString("\nhost: ")
	i.WriteString(broker)

	var now = time.Now().UTC().Format(http.TimeFormat)
	req.Header.Set("Date", now)
	i.WriteString("\ndate: ")
	i.WriteString(now)

	var dh = digest(buf)
	req.Header.Set("Digest", dh)
	i.WriteString("\ndigest: ")
	i.WriteString(dh)

	// sign with private key
	var sum = sha256.Sum256(i.Bytes())
	sig, err := rsa.SignPKCS1v15(rand.Reader, private, crypto.SHA256, sum[:])
	if err != nil {
		log.Fatalf("FAIL rsa.Sign, %v", err.Error)
	}
	var encoded = base64.StdEncoding.EncodeToString(sig)

	// compose into header format
	var b strings.Builder
	b.WriteString(`keyId="`)
	b.WriteString(subscriberPublicKey)
	b.WriteString(`",algorithm="rsa-sha256"`)
	b.WriteString(`,headers="(request-target) host date digest"`)
	b.WriteString(`,signature="`)
	b.WriteString(encoded)
	b.WriteString(`"`)

	req.Header.Set("Signature", b.String())
}

// author of the newsletter
func publisher() string {
	//TODO - arg user@example.com
	//     - fetch inbox field of actor JSON

	return authorAddr
}

// the newsletter which we will subscribe-to
func topic() []byte {
	// (? embed the template)
	/*
	   	`{
	   	"@context": "https://www.w3.org/ns/activitystreams",
	   	"id": "https://honk.example.com/my-first-follow",
	   	"type": "Follow",
	   	"actor": "https://honk.example.com/u/subfrom",
	   	"object": "https://mastodon.example.com/u/subto"
	   }`
	*/
	var b bytes.Buffer
	b.WriteString(`{`)
	b.WriteString(`"@context": "https://www.w3.org/ns/activitystreams"`)
	b.WriteString(`,"id": "`)
	b.WriteString(newFollowId())
	b.WriteString(`","type": "Follow"`)
	b.WriteString(`,"actor": "`)
	b.WriteString(subscriber)
	b.WriteString(`","object": "`)
	b.WriteString(author)
	b.WriteString(`"}`)
	return b.Bytes()
}

// checksum of the JSON body
func digest(dat []byte) string {
	var sum = sha256.Sum256(dat)
	var encoded = base64.StdEncoding.EncodeToString(sum[:])
	return "SHA-256=" + encoded
}

func newFollowId() string {
	return baseId + uuid.New().String()
}

type argsCfg struct {
	Private *rsa.PrivateKey
}

func readArgs() (*argsCfg, error) {
	var (
		err  error
		k    *rsa.PrivateKey
		priv = flag.String("priv", "private.pem", "PEM private key file path")
	)
	flag.Parse()
	log.SetFlags(log.Lshortfile | log.Ltime)
	if k, err = readPrivateKey(*priv); err != nil {
		return nil, err
	}
	return &argsCfg{Private: k}, nil
}

func readPrivateKey(filename string) (*rsa.PrivateKey, error) {
	var (
		err error
		buf []byte
		wd  string
		key *rsa.PrivateKey
	)
	wd = safepath(filename)
	if buf, err = os.ReadFile(wd); err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return nil, errors.New("No PEM file at given path")
		}
		return nil, err
	}

	block, _ := pem.Decode(buf)
	if block == nil {
		return nil, errors.New("PEM data not found")
	}
	////parseResult, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	key, err = x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	////key = parseResult.(*rsa.PrivateKey)

	return key, nil
}

func safepath(fpath string) string {
	if filepath.IsAbs(fpath) {
		return fpath
	}
	var err error
	var wd string
	if wd, err = os.UserHomeDir(); err == nil && wd != "" {
		return filepath.Join(wd, fpath)
	}
	if wd = os.Getenv("SNAP_USER_DATA"); wd != "" {
		return filepath.Join(wd, fpath)
	}
	if wd, err = filepath.Abs(fpath); err == nil {
		return wd
	}
	return filepath.Join(os.TempDir(), fpath)
}
