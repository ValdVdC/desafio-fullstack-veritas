package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"sync"
	"fmt"
)

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"` // "todo", "inprogress", "done"
}

type TaskStore struct {
	tasks  map[string]*Task
	mu     sync.RWMutex
	idCounter int
}

func NewTaskStore() *TaskStore {
	return &TaskStore{
		tasks: make(map[string]*Task),
		idCounter: 1,
	}
}

var ValidStatuses = map[string]bool{
	"todo":       true,
	"inprogress": true,
	"done":       true,
}

func (t *Task) Validate() error {
	if t.Title == "" {
		return errors.New("título é obrigatório")
	}
	if !ValidStatuses[t.Status] {
		return errors.New("status inválido: deve ser 'todo', 'inprogress' ou 'done'")
	}
	return nil
}

func (ts *TaskStore) GetAll() []*Task {
	ts.mu.RLock()
	defer ts.mu.RUnlock()

	tasks := make([]*Task, 0, len(ts.tasks))
	for _, task := range ts.tasks {
		tasks = append(tasks, task)
	}
	return tasks
}

func (ts *TaskStore) Get(id string) (*Task, bool) {
	ts.mu.RLock()
	defer ts.mu.RUnlock()

	task, exists := ts.tasks[id]
	return task, exists
}

func (ts *TaskStore) Create(task *Task) *Task {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	task.ID = fmt.Sprintf("%d", ts.idCounter)
	ts.idCounter++
	ts.tasks[task.ID] = task
	ts.saveToFile() 
	return task
}

func (ts *TaskStore) Update(id string, task *Task) (*Task, error) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	if _, exists := ts.tasks[id]; !exists {
		return nil, errors.New("tarefa não encontrada")
	}

	task.ID = id
	ts.tasks[id] = task
	ts.saveToFile() 
	return task, nil
}

func (ts *TaskStore) Delete(id string) error {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	if _, exists := ts.tasks[id]; !exists {
		return errors.New("tarefa não encontrada")
	}

	delete(ts.tasks, id)
	ts.saveToFile() 
	return nil
}

// Persistência simples 

func (ts *TaskStore) saveToFile() error {
	tasks := make([]*Task, 0, len(ts.tasks))
	for _, task := range ts.tasks {
		tasks = append(tasks, task)
	}

	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile("tasks.json", data, 0644)
}

func (ts *TaskStore) loadFromFile() error {
	data, err := ioutil.ReadFile("tasks.json")
	if err != nil {
		return err // Arquivo não existe ainda
	}

	var tasks []*Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return err
	}

	for _, task := range tasks {
		ts.tasks[task.ID] = task
		// Atualizar contador
		var id int
		fmt.Sscanf(task.ID, "%d", &id)
		if id >= ts.idCounter {
			ts.idCounter = id + 1
		}
	}

	return nil
}