import { FaTimes } from 'react-icons/fa';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const maxWidth = size === 'lg' ? 680 : size === 'sm' ? 360 : 480;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scaleIn" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
