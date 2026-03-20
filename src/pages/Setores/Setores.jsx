import { Component } from 'react'
import { Row, Col, Card, Table, Button, Form, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, ConfirmModal, TableFooter } from '../../common/_components'
import { BiSearch, BiX, BiPlus, BiPencil, BiTrash, BiCheckCircle, BiXCircle, BiGitBranch } from 'react-icons/bi'
import api from '../../services/api'

class Setores extends Component {
  state = {
    setores: [],
    loading: true,
    confirmDelete: null,
    filtroNome: '',
  }

  componentDidMount() { this.carregarDados() }

  carregarDados = () => {
    this.setState({ loading: true })
    // GET /api/setor/todos — retorna ativos + inativos
    api.get('/setor/todos')
      .then(res => this.setState({ setores: res.data }))
      .catch(() => toast.error('Erro ao carregar setores.'))
      .finally(() => this.setState({ loading: false }))
  }

  handleDesativar = (id) => {
    api.delete(`/setor/${id}`)
      .then(() => {
        toast.success('Setor desativado.')
        this.setState({ confirmDelete: null })
        this.carregarDados()
      })
      .catch(() => toast.error('Erro ao desativar setor.'))
  }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  getFiltrados() {
    const { setores, filtroNome } = this.state
    return setores.filter(s => !filtroNome || s.nome.toLowerCase().includes(filtroNome.toLowerCase()))
  }

  renderRows(filtrados) {
    if (filtrados.length === 0) {
      return (
        <tr><td colSpan={6}>
          <EmptyState icon={BiGitBranch} title="Nenhum setor encontrado" description="Adicione o primeiro setor da empresa." />
        </td></tr>
      )
    }
    return filtrados.map(s => (
      <tr key={s.id}>
        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{s.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BiGitBranch size={14} color="var(--primary)" /> {s.nome}
          </div>
        </td>
        <td style={{ fontSize: 13, color: 'var(--gray-600)', maxWidth: 300 }}>
          {s.descricao || <span style={{ color: 'var(--gray-300)' }}>—</span>}
        </td>
        <td>
          <span className={`badge-rh ${s.ativo ? 'badge-active' : 'badge-inactive'}`}>
            {s.ativo ? <BiCheckCircle className="me-1" /> : <BiXCircle className="me-1" />}
            {s.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
        </td>
        <td>
          <Button variant="light" size="sm" className="btn-edit-rh me-1"
            onClick={() => this.props.router.navigate(`/setores/editar/${s.id}`)}>
            <BiPencil />
          </Button>
          {s.ativo && (
            <Button variant="danger" size="sm" className="btn-danger-rh"
              onClick={() => this.setState({ confirmDelete: s })}>
              <BiTrash />
            </Button>
          )}
        </td>
      </tr>
    ))
  }

  render() {
    const { loading, confirmDelete, filtroNome, setores } = this.state
    const filtrados = this.getFiltrados()

    return (
      <div>
        <PageHeader
          title="Setores"
          sub={`${setores.length} setor${setores.length !== 1 ? 'es' : ''} cadastrado${setores.length !== 1 ? 's' : ''}`}
          action={
            <Button className="btn-primary-rh" onClick={() => this.props.router.navigate('/setores/novo')}>
              <BiPlus className="me-1" /> Adicionar Setor
            </Button>
          }
        />

        <Card className="filter-bar mb-3">
          <Card.Body>
            <div className="filter-bar-title">Filtros</div>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label className="form-label-rh">Nome do setor</Form.Label>
                <div className="input-icon-wrap">
                  <BiSearch size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  <Form.Control className="form-control-rh" placeholder="Buscar por nome..."
                    name="filtroNome" value={filtroNome} onChange={this.handleChange} />
                </div>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="light" className="btn-ghost-rh w-100"
                  onClick={() => this.setState({ filtroNome: '' })} title="Limpar">
                  <BiX />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="card-rh">
          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}><Spinner style={{ color: 'var(--primary)' }} /></div>
            ) : (
              <Table responsive className="table-rh mb-0">
                <thead>
                  <tr>
                    <th>ID</th><th>Nome</th><th>Descrição</th>
                    <th>Status</th><th>Criado em</th><th style={{ width: 120 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>{this.renderRows(filtrados)}</tbody>
              </Table>
            )}
            <TableFooter shown={filtrados.length} total={setores.length} itemLabel="setor" />
          </Card.Body>
        </Card>

        <ConfirmModal
          show={!!confirmDelete}
          onHide={() => this.setState({ confirmDelete: null })}
          onConfirm={() => this.handleDesativar(confirmDelete.id)}
          title="Desativar setor"
          confirmLabel="Desativar"
          ConfirmIcon={BiTrash}
        >
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            Tem certeza que deseja desativar o setor <strong>{confirmDelete?.nome}</strong>?
          </p>
        </ConfirmModal>
      </div>
    )
  }
}

export default withRouter(Setores)
