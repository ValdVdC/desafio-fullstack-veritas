package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	store := NewTaskStore()

	store.loadFromFile()

	handler := NewHandler(store)

	router := mux.NewRouter()

	router.HandleFunc("/tasks", handler.GetTasks).Methods("GET")
	router.HandleFunc("/tasks", handler.CreateTask).Methods("POST")
	router.HandleFunc("/tasks/{id}", handler.GetTask).Methods("GET")
	router.HandleFunc("/tasks/{id}", handler.UpdateTask).Methods("PUT")
	router.HandleFunc("/tasks/{id}", handler.DeleteTask).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Frontend React
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})

	corsHandler := c.Handler(router)

	log.Println("Servidor rodando em http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}