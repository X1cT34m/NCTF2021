package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	_ "github.com/mattn/go-sqlite3"
	uuid "github.com/satori/go.uuid"
)

var db *sql.DB

var indexSite = "https://prettynote.bycsec404.top"
var sandboxSite = "https://store.prettynote.bycsec404.top"
var store = sessions.NewCookieStore(securecookie.GenerateRandomKey(32))
var indexTmpl = template.Must(template.ParseFiles("./templates/index.html"))
var sandboxTmpl = template.Must(template.ParseFiles("./templates/sandbox.html"))

type Note struct {
	Id      string
	Content string
}

type Page struct {
	Site     string
	CSPNonce string
}

func genNonce() string {
	var b [32]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return base64.URLEncoding.EncodeToString(b[:])
}

func createNote(uid, content string) {
	stmt, _ := db.Prepare("INSERT INTO notes(uid, content) VALUES (?, ?);")
	_, _ = stmt.Exec(uid, content)
}

func deleteNote(uid string) {
	stmt, _ := db.Prepare("DELETE FROM notes WHERE uid = ?")
	_, _ = stmt.Exec(uid)
}

func findNote(uid string) Note {
	var content string

	row := db.QueryRow("SELECT content FROM notes WHERE uid = ?", uid)
	err := row.Scan(&content)
	if err == nil {
		return Note{Content: content}
	}
	return Note{Content: ""}
}

func NoteMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		session, err := store.Get(req, "session")
		if err != nil {
			_, _ = fmt.Fprint(w, err)
			return
		}
		uid, _ := session.Values["uid"]
		if uid == nil {
			userId := uuid.NewV4()
			session.Values["uid"] = userId.String()
			err := session.Save(req, w)
			if err != nil {
				_, _ = fmt.Fprintf(w, "Error saving session")
				return
			}
		}
		w.Header().Set("X-Frame-Options", "Deny")
		req = req.WithContext(context.WithValue(req.Context(), "session", session))
		next.ServeHTTP(w, req)
	})
}

func getHandler(w http.ResponseWriter, req *http.Request) {
	session := req.Context().Value("session").(*sessions.Session)
	uid, _ := session.Values["uid"]
	if uid != nil {
		w.Header().Set("Content-Security-Policy",
			`default-src 'none'; frame-src 'none'; script-src 'none'; style-src 'none'; connect-src 'none';`)
		note := findNote(uid.(string))
		_, _ = fmt.Fprintf(w, note.Content)
	} else {
		_, _ = fmt.Fprintf(w, "You don't have any note")
	}
}

func addHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	session := req.Context().Value("session").(*sessions.Session)
	uid, _ := session.Values["uid"]
	note := findNote(uid.(string))
	if note.Content != "" {
		_, _ = fmt.Fprintf(w, "You've already stored a note")
	} else {
		var note Note
		reqBody, _ := ioutil.ReadAll(req.Body)
		err := json.Unmarshal(reqBody, &note)
		if err != nil {
			_, _ = fmt.Fprintf(w, "Error reading JSON body")
			return
		}
		if len(note.Content) > 300 {
			_, _ = fmt.Fprintf(w, "Too much words!")
			return
		}
		createNote(uid.(string), note.Content)
		http.Redirect(w, req, "/", http.StatusFound)
	}
}

func deleteHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	session := req.Context().Value("session").(*sessions.Session)
	uid, _ := session.Values["uid"]
	if uid != nil {
		deleteNote(uid.(string))
		session.Values["uid"] = nil
		err := session.Save(req, w)
		if err != nil {
			_, _ = fmt.Fprintf(w, "Successfully delete your note")
			return
		}
		_, _ = fmt.Fprintf(w, "Error saving session")
	} else {
		_, _ = fmt.Fprintf(w, "No note to delete")
	}
}

func index(w http.ResponseWriter, _ *http.Request) {
	nonce := genNonce()
	w.Header().Set("X-Frame-Options", "Deny")
	w.Header().Set("Content-Security-Policy", fmt.Sprintf(
		"default-src 'self'; frame-src %s/; worker-src 'none'; script-src 'nonce-%s'; base-uri 'none';",
		sandboxSite, nonce))
	_ = indexTmpl.Execute(w, Page{Site: sandboxSite, CSPNonce: nonce})
}

func sandbox(w http.ResponseWriter, _ *http.Request) {
	nonce := genNonce()
	w.Header().Set("X-Frame-Options", "Deny")
	w.Header().Set("Content-Security-Policy", fmt.Sprintf(
		"default-src %s/; style-src 'self'; worker-src 'none'; frame-ancestors %s/; script-src 'nonce-%s' %s/; base-uri 'none';",
		indexSite, indexSite, nonce, indexSite))
	_ = sandboxTmpl.Execute(w, Page{Site: indexSite, CSPNonce: nonce})
}

func initDatabase() {
	stmt, _ := db.Prepare("CREATE TABLE IF NOT EXISTS notes (uid varchar(36), content varchar(300));")
	_, _ = stmt.Exec()

	stmt, _ = db.Prepare("DELETE FROM notes")
	_, _ = stmt.Exec()
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./database.db")
	if err != nil {
		log.Fatal(err.Error())
	}

	go initDatabase()

	r := mux.NewRouter().StrictSlash(true)

	fs := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))
	r.HandleFunc("/", index).Methods("GET")

	note := r.PathPrefix("/note").Subrouter()
	note.Use(NoteMiddleware)
	note.HandleFunc("/", getHandler).Methods("GET")
	note.HandleFunc("/add", addHandler).Methods("POST")
	note.HandleFunc("/delete", deleteHandler).Methods("DELETE")

	loggedRouter := handlers.LoggingHandler(os.Stdout, r)

	app := &http.Server{
		Addr:         "0.0.0.0:3000",
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      loggedRouter,
	}

	s := mux.NewRouter().StrictSlash(true)
	s.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))
	s.HandleFunc("/", sandbox).Methods("GET")
	sandboxRouter := handlers.LoggingHandler(os.Stdout, s)

	sandBox := &http.Server{
		Addr:         "0.0.0.0:4000",
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      sandboxRouter,
	}

	wg := new(sync.WaitGroup)

	wg.Add(2)

	go func() {
		log.Println("Server started on: http://0.0.0.0:3000")
		if err := app.ListenAndServe(); err != nil {
			log.Println(err)
		}
		wg.Done()
	}()

	go func() {
		log.Println("Server started on: http://0.0.0.0:4000")
		if err := sandBox.ListenAndServe(); err != nil {
			log.Println(err)
		}
		wg.Done()
	}()

	wg.Wait()
}
