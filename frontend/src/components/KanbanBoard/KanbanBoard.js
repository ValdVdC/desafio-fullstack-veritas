import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from '../Column/Column';
import TaskForm from '../TaskForm/TaskForm';
import Modal from '../Modal/Modal';
import './KanbanBoard.css';

const API_URL = 'http://localhost:8080/tasks';

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar tarefas. Verifique se o backend está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await axios.post(API_URL, taskData);
      setTasks([...tasks, response.data]);
      setShowForm(false);
    } catch (err) {
      setErrorMessage('Erro ao criar tarefa: ' + (err.response?.data?.error || err.message));
      setShowErrorModal(true);
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (err) {
      setErrorMessage('Erro ao atualizar tarefa: ' + (err.response?.data?.error || err.message));
      setShowErrorModal(true);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setErrorMessage('Erro ao excluir tarefa: ' + (err.response?.data?.error || err.message));
      setShowErrorModal(true);
    }
  };

  const moveTask = (id, newStatus) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { ...task, status: newStatus });
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    }

    moveTask(draggableId, destination.droppableId);
  };

  if (loading) {
    return <div className="loading">Carregando tarefas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const columns = [
    { id: 'todo', title: 'A Fazer', status: 'todo' },
    { id: 'inprogress', title: 'Em Progresso', status: 'inprogress' },
    { id: 'done', title: 'Concluídas', status: 'done' }
  ];

  return (
    <>
      <div className="kanban-container">
        <div className="kanban-actions">
          <button onClick={() => setShowForm(!showForm)} className="btn-add">
            {showForm ? '✕ Cancelar' : '+ Nova Tarefa'}
          </button>
        </div>

        {showForm && <TaskForm onSubmit={addTask} onCancel={() => setShowForm(false)} />}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {columns.map(column => (
              <Column
                key={column.id}
                title={column.title}
                status={column.status}
                tasks={tasks.filter(task => task.status === column.status)}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onMove={moveTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="❌ Erro"
        message={errorMessage}
        type="error"
      />
    </>
  );
}

export default KanbanBoard;