import { Row, Col, Button, Modal, Spinner, Form } from 'react-bootstrap'
import {
  BiSearch, BiX, BiPlus, BiPencil, BiTrash, BiArrowBack,
  BiCheck, BiInfoCircle, BiCamera, BiImage, BiKey,
  BiBuilding, BiLock, BiPhone, BiMapAlt, BiUser, BiCalendar,
  BiIdCard, BiGroup, BiDoorOpen, BiBarcode, BiGitBranch, BiGrid, BiRocket, BiLogOut
} from 'react-icons/bi'
import { FaEye, FaEyeSlash } from "react-icons/fa";

export {
  BiSearch, BiX, BiPlus, BiPencil, BiTrash, BiArrowBack,
  BiCheck, BiInfoCircle, BiCamera, BiImage, BiKey,
  BiBuilding, BiLock, BiPhone, BiMapAlt, BiUser, BiCalendar,
  BiIdCard, BiGroup, BiDoorOpen, BiBarcode, BiGitBranch, BiGrid, BiRocket, BiLogOut, FaEye, FaEyeSlash
}

export function PageHeader({ title, sub, action }) {
  return (
    <Row className="align-items-center mb-3">
      <Col><div className="page-header-info"><h1>{title}</h1>{sub && <p>{sub}</p>}</div></Col>
      {action && <Col xs="auto">{action}</Col>}
    </Row>
  )
}

export function LoadingSpinner({ padding = 48 }) {
  return <div style={{ padding, textAlign: 'center' }}><Spinner style={{ color: 'var(--primary)' }} /></div>
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

export function ConfirmModal({ show, onHide, onConfirm, title, children, confirmLabel = 'Confirmar', ConfirmIcon = BiTrash }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" className="btn-ghost-rh" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" className="btn-danger-rh" onClick={onConfirm}>
          <ConfirmIcon className="me-1" /> {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export function InfoRow({ icon: Icon, label, value, last = false }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, background: 'var(--primary-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {Icon && <Icon size={16} color="var(--primary)" />}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500, marginTop: 2 }}>{value || '—'}</div>
      </div>
    </div>
  )
}

export function TableFooter({ shown, total, itemLabel = 'resultado' }) {
  if (shown === 0) return null
  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-500)' }}>
      Exibindo <strong>{shown}</strong> de <strong>{total}</strong> {itemLabel}{total !== 1 ? 's' : ''}
    </div>
  )
}

export function InputWithIcon({ icon: Icon, children, showToggle, showPwd, onToggle }) {
  return (
    <div className="input-icon-wrap">
      {Icon && <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />}
      {children}
      {showToggle && (
        <button type="button" className="eye-toggle" onClick={onToggle}>
          {showPwd ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
        </button>
      )}
    </div>
  )
}

export function FormField({ label, hint, className = 'form-group-rh', children }) {
  return (
    <Form.Group className={className}>
      {label && <Form.Label className="form-label-rh">{label}</Form.Label>}
      {children}
      {hint && <Form.Text className="form-hint">{hint}</Form.Text>}
    </Form.Group>
  )
}

export function LogoUpload({ fileRef, preview, onChange, label = 'Logo da empresa', optional = true }) {
  return (
    <Form.Group className="form-group-rh">
      <Form.Label className="form-label-rh">
        {label}{optional && <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}> (opcional)</span>}
      </Form.Label>
      <div className="logo-upload" onClick={() => fileRef.current.click()}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onChange} />
        {preview
          ? <img src={preview} alt="Logo" className="preview" />
          : <>
              <BiImage size={32} style={{ color: 'var(--gray-400)', display: 'block', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Clique para enviar o logo</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>PNG, JPG até 2MB</div>
            </>
        }
      </div>
    </Form.Group>
  )
}
