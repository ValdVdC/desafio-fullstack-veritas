import { useState } from 'react';
import Modal from '../Modal/Modal';
import './TaskCard.css';

function TaskCard({ task, onUpdate, onDelete, onMove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('O título é obrigatório');
      setShowErrorModal(true);
      return;
    }
    onUpdate(task.id, { ...task, title, description });
    setIsEditing(false);
  };

  const handleMove = (newStatus) => {
    onMove(task.id, newStatus);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDelete(task.id);
  };

  if (isEditing) {
    return (
      <>
        <div className="task-card editing">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="edit-input"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">Salvar</button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancelar</button>
          </div>
        </div>

        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="⚠️ Atenção"
          message={errorMessage}
          type="error"
        />
      </>
    );
  }

  return (
    <>
      <div className="task-card">
        <div className="task-content">
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
        </div>
        
        <div className="task-actions">
          <button onClick={() => setIsEditing(true)} className="btn-edit" title="Editar">
            ✏️
          </button>
          <button onClick={handleDeleteClick} className="btn-delete" title="Excluir">
            🗑️
          </button>
        </div>

        <div className="task-move">
          {task.status !== 'todo' && (
            <button onClick={() => handleMove('todo')} className="btn-move">← A Fazer</button>
          )}
          {task.status === 'todo' && (
            <button onClick={() => handleMove('inprogress')} className="btn-move">Em Progresso →</button>
          )}
          {task.status === 'inprogress' && (
            <button onClick={() => handleMove('done')} className="btn-move">Concluir ✓</button>
          )}
          {task.status === 'done' && (
            <button onClick={() => handleMove('inprogress')} className="btn-move">← Voltar</button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="🗑️ Excluir Tarefa"
        message={`Deseja realmente excluir a tarefa "${task.title}"? Esta ação não pode ser desfeita.`}
        type="confirm"
      />
    </>
  );
}

export default TaskCard;