import { Component, createRef }                    from 'react'
import { Row, Col, Card, Form, Button, Spinner }   from 'react-bootstrap'
import { toast }                                   from 'react-toastify'
import { withRouter }                              from '../../common/withRouter'
import { withAuth }                                from '../../contexts/AuthContext'
import { maskPhone }                               from '../../common/masks'
import { PageHeader, InfoRow, FormField }          from '../../common/_components'
import {
  BiBuilding, BiBarcode, BiMapAlt, BiPhone,
  BiUser, BiCalendar, BiCamera, BiCheck, BiPencil
} from 'react-icons/bi'
import api from '../../services/api'

const INFO_ITEMS = [
  { Icon: BiBuilding, label: 'Razão Social', key: 'razaoSocial' },
  { Icon: BiBarcode,  label: 'CNPJ',         key: 'cnpj' },
  { Icon: BiMapAlt,   label: 'Endereço',     key: 'endereco' },
  { Icon: BiPhone,    label: 'Telefone',     key: 'telefone' },
]

class PerfilEmpresa extends Component {
  constructor(props) {
    super(props)
    this.fileRef = createRef()
    const e = props.auth.empresa

    this.state = {
      editing:              false,
      loading:              false,
      logoPreview:          e?.logoBase64          ?? null,
      logoBase64:           e?.logoBase64          ?? null,
      razaoSocial:          e?.razaoSocial         ?? '',
      endereco:             e?.endereco            ?? '',
      telefone:             e?.telefone            ?? '',
      responsavelNome:      e?.responsavelNome     ?? '',
      responsavelSobrenome: e?.responsavelSobrenome ?? '',
    }
  }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => this.setState({ logoPreview: ev.target.result, logoBase64: ev.target.result })
    reader.readAsDataURL(file)
  }

  handleCancel = () => {
    const e = this.props.auth.empresa
    this.setState({
      editing: false,
      logoPreview:          e?.logoBase64          ?? null,
      logoBase64:           e?.logoBase64          ?? null,
      razaoSocial:          e?.razaoSocial         ?? '',
      endereco:             e?.endereco            ?? '',
      telefone:             e?.telefone            ?? '',
      responsavelNome:      e?.responsavelNome     ?? '',
      responsavelSobrenome: e?.responsavelSobrenome ?? '',
    })
  }

  enviaRegistro = (e) => {
    e.preventDefault()
    const { razaoSocial, endereco, telefone, responsavelNome, responsavelSobrenome, logoBase64 } = this.state
    const { empresa, updateEmpresa } = this.props.auth

    this.setState({ loading: true })
    api.put(`/empresa/${empresa.id}`, { razaoSocial, endereco, telefone, logoBase64, responsavelNome, responsavelSobrenome })
      .then(res => {
        updateEmpresa(res.data)
        toast.success('Perfil atualizado com sucesso!')
        this.setState({ editing: false, loading: false })
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao atualizar perfil.')
        this.setState({ loading: false })
      })
  }

  renderAvatar() {
    const { editing, logoPreview } = this.state
    const { empresa } = this.props.auth
    const iniciais = empresa
      ? `${empresa.responsavelNome?.[0] ?? ''}${empresa.responsavelSobrenome?.[0] ?? ''}`.toUpperCase()
      : 'RH'

    return (
      <Card className="card-rh">
        <Card.Body className="card-rh-body text-center">
          <div
            style={{
              width: 96, height: 96, borderRadius: '50%',
              background: logoPreview ? 'transparent' : 'var(--primary)',
              margin: '0 auto 16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 800, color: '#fff',
              fontFamily: 'var(--font-display)', overflow: 'hidden',
              border: '3px solid var(--border)', position: 'relative',
              cursor: editing ? 'pointer' : 'default',
            }}
            onClick={() => editing && this.fileRef.current.click()}
          >
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : iniciais}
            {editing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <BiCamera size={20} color="#fff" />
              </div>
            )}
          </div>
          <input ref={this.fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={this.handleLogo} />

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
            {empresa?.razaoSocial}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
            CNPJ: <strong>{empresa?.cnpj}</strong>
          </div>
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
              Responsável de RH
            </div>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
              {empresa?.responsavelNome} {empresa?.responsavelSobrenome}
            </div>
          </div>
          {editing && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--primary)' }}>
              Clique na imagem para trocar o logo
            </div>
          )}
        </Card.Body>
      </Card>
    )
  }

  renderInfoView() {
    const { empresa } = this.props.auth
    return (
      <div>
        {INFO_ITEMS.map(item => (
          <InfoRow key={item.label} icon={item.Icon} label={item.label} value={empresa?.[item.key]} />
        ))}
        <InfoRow icon={BiUser} label="Responsável"
          value={`${empresa?.responsavelNome ?? ''} ${empresa?.responsavelSobrenome ?? ''}`.trim()} />
        <InfoRow icon={BiCalendar} label="Cadastrado em"
          value={empresa?.criadoEm ? new Date(empresa.criadoEm).toLocaleDateString('pt-BR') : null}
          last />
      </div>
    )
  }

  renderInfoEdit() {
    const { razaoSocial, endereco, telefone, responsavelNome, responsavelSobrenome, loading } = this.state
    return (
      <Form onSubmit={this.enviaRegistro}>
        <Row className="g-3">
          <Col xs={12}>
            <FormField label="Razão Social *">
              <Form.Control className="form-control-rh" name="razaoSocial"
                value={razaoSocial} onChange={this.handleChange} required />
            </FormField>
          </Col>
          <Col md={8}>
            <FormField label="Endereço">
              <Form.Control className="form-control-rh" placeholder="Rua, número, cidade"
                name="endereco" value={endereco} onChange={this.handleChange} />
            </FormField>
          </Col>
          <Col md={4}>
            <FormField label="Telefone">
              <Form.Control className="form-control-rh" placeholder="(00) 00000-0000"
                name="telefone" value={telefone}
                onChange={e => this.setState({ telefone: maskPhone(e.target.value) })} />
            </FormField>
          </Col>
          <Col md={6}>
            <FormField label="Nome do responsável *">
              <Form.Control className="form-control-rh" name="responsavelNome"
                value={responsavelNome} onChange={this.handleChange} required />
            </FormField>
          </Col>
          <Col md={6}>
            <FormField label="Sobrenome do responsável *">
              <Form.Control className="form-control-rh" name="responsavelSobrenome"
                value={responsavelSobrenome} onChange={this.handleChange} required />
            </FormField>
          </Col>
        </Row>
        <div className="d-flex gap-3 justify-content-end mt-4">
          <Button variant="light" className="btn-ghost-rh" onClick={this.handleCancel}>Cancelar</Button>
          <Button type="submit" className="btn-primary-rh" disabled={loading}>
            {loading
              ? <><Spinner size="sm" className="me-2" />Salvando...</>
              : <><BiCheck className="me-1" /> Salvar alterações</>
            }
          </Button>
        </div>
      </Form>
    )
  }

  render() {
    const { editing } = this.state
    return (
      <div>
        <PageHeader
          title="Perfil da Empresa"
          sub="Informações e configurações da sua organização."
          action={!editing && (
            <Button className="btn-primary-rh" onClick={() => this.setState({ editing: true })}>
              <BiPencil className="me-1" /> Editar perfil
            </Button>
          )}
        />
        <Row className="g-4">
          <Col lg={4}>{this.renderAvatar()}</Col>
          <Col lg={8}>
            <Card className="card-rh">
              <div className="card-rh-header">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {editing ? 'Editar informações' : 'Informações da empresa'}
                </div>
              </div>
              <Card.Body className="card-rh-body">
                {editing ? this.renderInfoEdit() : this.renderInfoView()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withAuth(withRouter(PerfilEmpresa))
