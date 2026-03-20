import { Component } from 'react'
import { Card, Table, Button, Form, Row, Col, Spinner, Dropdown } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, ConfirmModal, TableFooter } from '../../common/_components'
import {
  BiPlus, BiPencil, BiTrash, BiSearch, BiX, BiCopy,
  BiArchive, BiCheckCircle, BiFile
} from 'react-icons/bi'
import {
  CATEGORIA_LABEL, STATUS_BADGE, STATUS_LABEL, TIPO_USO_OPTIONS
} from '../../common/modeloUtils'
import api from '../../services/api'

class Modelos extends Component {
  state = {
    modelos:       [],
    loading:       true,
    confirmDelete: null,
    filtroNome:    '',
    filtroStatus:  '',
    filtroCategoria: '',
  }

  componentDidMount() { this.carregarDados() }

  carregarDados = () => {
    this.setState({ loading: true })
    api.get('/modelo')
      .then(res => this.setState({ modelos: res.data }))
      .catch(() => toast.error('Erro ao carregar modelos.'))
      .finally(() => this.setState({ loading: false }))
  }

  handleDesativar = (id) => {
    api.delete(`/modelo/${id}`)
      .then(() => {
        toast.success('Modelo arquivado.')
        this.setState({ confirmDelete: null })
        this.carregarDados()
      })
      .catch(() => toast.error('Erro ao arquivar modelo.'))
  }

  handleDuplicar = (id) => {
    api.post(`/modelo/${id}/duplicar`)
      .then(() => {
        toast.success('Modelo duplicado!')
        this.carregarDados()
      })
      .catch(() => toast.error('Erro ao duplicar modelo.'))
  }

  handlePublicar = (id) => {
    api.patch(`/modelo/${id}/publicar`)
      .then(() => {
        toast.success('Modelo publicado!')
        this.carregarDados()
      })
      .catch(err => toast.error(err.response?.data ?? 'Erro ao publicar modelo.'))
  }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  getFiltrados() {
    const { modelos, filtroNome, filtroStatus, filtroCategoria } = this.state
    return modelos.filter(m => {
      const nomeOk   = !filtroNome      || m.nome.toLowerCase().includes(filtroNome.toLowerCase())
      const statusOk = !filtroStatus    || m.status === filtroStatus
      const catOk    = !filtroCategoria || m.categoria === filtroCategoria
      return nomeOk && statusOk && catOk
    })
  }

  renderRows(filtrados) {
    if (filtrados.length === 0) {
      return (
        <tr><td colSpan={7}>
          <EmptyState icon={BiFile} title="Nenhum modelo encontrado"
            description="Crie o primeiro modelo de documento." />
        </td></tr>
      )
    }

    return filtrados.map(m => (
      <tr key={m.id}>
        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{m.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{m.nome}</div>
          {m.descricao && (
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{m.descricao}</div>
          )}
        </td>
        <td>
          <span className="badge-rh badge-info" style={{ fontSize: 11 }}>
            {CATEGORIA_LABEL[m.categoria] ?? m.categoria}
          </span>
        </td>
        <td>
          <span className={`badge-rh ${STATUS_BADGE[m.status] ?? 'badge-info'}`} style={{ fontSize: 11 }}>
            {STATUS_LABEL[m.status] ?? m.status}
          </span>
        </td>
        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>v{m.versao}</td>
        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {new Date(m.criadoEm).toLocaleDateString('pt-BR')}
        </td>
        <td>
          <div className="d-flex gap-1 align-items-center">
            <Button variant="light" size="sm" className="btn-edit-rh"
              onClick={() => this.props.router.navigate(`/modelos/editar/${m.id}`)}>
              <BiPencil size={13} />
            </Button>

            {m.status === 'rascunho' && (
              <Button variant="success" size="sm"
                style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, border: 'none' }}
                onClick={() => this.handlePublicar(m.id)}
                title="Publicar">
                <BiCheckCircle size={13} />
              </Button>
            )}

            <Button variant="light" size="sm" className="btn-edit-rh"
              onClick={() => this.handleDuplicar(m.id)}
              title="Duplicar">
              <BiCopy size={13} />
            </Button>

            {m.status !== 'arquivado' && (
              <Button variant="danger" size="sm" className="btn-danger-rh"
                onClick={() => this.setState({ confirmDelete: m })}
                title="Arquivar">
                <BiArchive size={13} />
              </Button>
            )}
          </div>
        </td>
      </tr>
    ))
  }

  render() {
    const { loading, confirmDelete, filtroNome, filtroStatus, filtroCategoria, modelos } = this.state
    const filtrados = this.getFiltrados()

    return (
      <div>
        <PageHeader
          title="Modelos de Documentos"
          sub={`${modelos.length} modelo${modelos.length !== 1 ? 's' : ''} cadastrado${modelos.length !== 1 ? 's' : ''}`}
          action={
            <Button className="btn-primary-rh"
              onClick={() => this.props.router.navigate('/modelos/novo')}>
              <BiPlus className="me-1" /> Novo Modelo
            </Button>
          }
        />

        <Card className="filter-bar mb-3">
          <Card.Body>
            <div className="filter-bar-title">Filtros</div>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="form-label-rh">Nome</Form.Label>
                <div className="input-icon-wrap">
                  <BiSearch size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  <Form.Control className="form-control-rh" placeholder="Buscar por nome..."
                    name="filtroNome" value={filtroNome} onChange={this.handleChange} />
                </div>
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh">Status</Form.Label>
                <Form.Select className="form-control-rh" name="filtroStatus"
                  value={filtroStatus} onChange={this.handleChange}>
                  <option value="">Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                  <option value="arquivado">Arquivado</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh">Categoria</Form.Label>
                <Form.Select className="form-control-rh" name="filtroCategoria"
                  value={filtroCategoria} onChange={this.handleChange}>
                  <option value="">Todas</option>
                  {Object.entries(CATEGORIA_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="light" className="btn-ghost-rh w-100"
                  onClick={() => this.setState({ filtroNome: '', filtroStatus: '', filtroCategoria: '' })}>
                  <BiX />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="card-rh">
          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Spinner style={{ color: 'var(--primary)' }} />
              </div>
            ) : (
              <Table responsive className="table-rh mb-0">
                <thead>
                  <tr>
                    <th>ID</th><th>Nome</th><th>Categoria</th>
                    <th>Status</th><th>Versão</th><th>Criado em</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>{this.renderRows(filtrados)}</tbody>
              </Table>
            )}
            <TableFooter shown={filtrados.length} total={modelos.length} itemLabel="modelo" />
          </Card.Body>
        </Card>

        <ConfirmModal
          show={!!confirmDelete}
          onHide={() => this.setState({ confirmDelete: null })}
          onConfirm={() => this.handleDesativar(confirmDelete.id)}
          title="Arquivar modelo"
          confirmLabel="Arquivar"
          ConfirmIcon={BiArchive}
        >
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            Tem certeza que deseja arquivar o modelo <strong>{confirmDelete?.nome}</strong>?
            Ele não estará mais disponível para novos documentos.
          </p>
        </ConfirmModal>
      </div>
    )
  }
}

export default withRouter(Modelos)
