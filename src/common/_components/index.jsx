import { Row, Col, Button, Modal, Spinner, Form } from 'react-bootstrap'

// ── PageHeader ──────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <Row className="align-items-center mb-3">
      <Col>
        <div className="page-header-info">
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
      </Col>
      {action && <Col xs="auto">{action}</Col>}
    </Row>
  )
}

// ── LoadingSpinner ───────────────────────────────────────────
export function LoadingSpinner({ padding = 48 }) {
  return (
    <div style={{ padding, textAlign: 'center' }}>
      <Spinner style={{ color: 'var(--primary)' }} />
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

// ── ConfirmModal ─────────────────────────────────────────────
export function ConfirmModal({ show, onHide, onConfirm, title, children, confirmLabel = 'Confirmar', confirmIcon = 'bi-check-lg' }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" className="btn-ghost-rh" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" className="btn-danger-rh" onClick={onConfirm}>
          <i className={`bi ${confirmIcon}`} /> {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ── InfoRow ──────────────────────────────────────────────────
// Linha de informação com ícone — usada em cards de perfil/detalhes
export function InfoRow({ icon, label, value, last = false }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, background: 'var(--primary-bg)', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ color: 'var(--primary)', fontSize: 15 }} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500, marginTop: 2 }}>
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

// ── TableFooter ──────────────────────────────────────────────
export function TableFooter({ shown, total, itemLabel = 'resultado' }) {
  if (shown === 0) return null
  const plural = total !== 1 ? 's' : ''
  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-500)' }}>
      Exibindo <strong>{shown}</strong> de <strong>{total}</strong> {itemLabel}{plural}
    </div>
  )
}

// ── InputWithIcon ────────────────────────────────────────────
// Input com ícone à esquerda e toggle de senha opcional
export function InputWithIcon({ icon, children, showToggle, showPwd, onToggle }) {
  return (
    <div className="input-icon-wrap">
      <i className={`bi ${icon}`} />
      {children}
      {showToggle && (
        <button type="button" className="eye-toggle" onClick={onToggle}>
          <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} />
        </button>
      )}
    </div>
  )
}

// ── FormField ────────────────────────────────────────────────
// Wrapper de campo com label e hint opcionais
export function FormField({ label, hint, className = 'form-group-rh', children }) {
  return (
    <Form.Group className={className}>
      {label && <Form.Label className="form-label-rh">{label}</Form.Label>}
      {children}
      {hint && <Form.Text className="form-hint">{hint}</Form.Text>}
    </Form.Group>
  )
}

// ── LogoUpload ───────────────────────────────────────────────
export function LogoUpload({ fileRef, preview, onChange, label = 'Logo da empresa', optional = true }) {
  return (
    <Form.Group className="form-group-rh">
      <Form.Label className="form-label-rh">
        {label}
        {optional && <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}> (opcional)</span>}
      </Form.Label>
      <div className="logo-upload" onClick={() => fileRef.current.click()}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onChange} />
        {preview
          ? <img src={preview} alt="Logo" className="preview" />
          : <>
              <i className="bi bi-image" style={{ fontSize: 32, color: 'var(--gray-400)', display: 'block', marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Clique para enviar o logo</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>PNG, JPG até 2MB</div>
            </>
        }
      </div>
    </Form.Group>
  )
}
