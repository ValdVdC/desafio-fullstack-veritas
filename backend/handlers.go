package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type Handler struct {
	store *TaskStore
}

func NewHandler(store *TaskStore) *Handler {
	return &Handler{store: store}
}

// Retorna todas as tarefas
func (h *Handler) GetTasks(w http.ResponseWriter, r *http.Request) {
	tasks := h.store.GetAll()
	respondJSON(w, http.StatusOK, tasks)
}

// Retorna uma tarefa específica
func (h *Handler) GetTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	task, exists := h.store.Get(id)
	if !exists {
		respondError(w, http.StatusNotFound, "Tarefa não encontrada")
		return
	}

	respondJSON(w, http.StatusOK, task)
}

// Cria uma nova tarefa
func (h *Handler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		respondError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	if err := task.Validate(); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	createdTask := h.store.Create(&task)
	respondJSON(w, http.StatusCreated, createdTask)
}

// Atualiza uma tarefa
func (h *Handler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		respondError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	if err := task.Validate(); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	updatedTask, err := h.store.Update(id, &task)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, updatedTask)
}

// Remove uma tarefa
func (h *Handler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.store.Delete(id); err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Tarefa excluída"})
}

// Envia uma resposta JSON
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// Eenvia uma resposta de erro
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}