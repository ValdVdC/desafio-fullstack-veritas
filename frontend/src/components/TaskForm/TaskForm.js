import { useState } from 'react';
import Modal from '../Modal/Modal';
import './TaskForm.css';

function TaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setShowErrorModal(true);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status: 'todo'
    });

    setTitle('');
    setDescription('');
  };

  return (
    <>
      <div className="task-form-container">
        <form onSubmit={handleSubmit} className="task-form">
          <h3>Nova Tarefa</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da tarefa *"
            className="form-input"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="form-textarea"
            rows="3"
          />
          <div className="form-actions">
            <button type="submit" className="btn-submit">Criar Tarefa</button>
            <button type="button" onClick={onCancel} className="btn-cancel-form">Cancelar</button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="⚠️ Atenção"
        message="O título é obrigatório para criar uma tarefa."
        type="error"
      />
    </>
  );
}

export default TaskForm;