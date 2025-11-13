import './Modal.css';

function Modal({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>
        
        <div className="modal-footer">
          {type === 'confirm' ? (
            <>
              <button className="btn-modal btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-modal btn-confirm" onClick={onConfirm}>
                Confirmar
              </button>
            </>
          ) : (
            <button className="btn-modal btn-ok" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;