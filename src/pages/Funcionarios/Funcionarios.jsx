import { Component } from 'react'
import { Row, Col, Card, Table, Button, Form, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, ConfirmModal, TableFooter } from '../../common/_components'
import { TURNO_LABEL, GENERO_LABEL, TURNO_BADGE } from '../../common/utils'
import api from '../../services/api'

class Funcionarios extends Component {
  state = {
    funcionarios: [],
    setores: [],
    loading: true,
    confirmDelete: null,
    filtroNome: '',
    filtroSetor: '',
    filtroTurno: '',
    filtroGenero: '',
  }

  componentDidMount() {
    this.carregarDados()
  }

  carregarDados = () => {
    this.setState({ loading: true })

    // GET /api/funcionario
    api.get('/funcionario')
      .then(res => this.setState({ funcionarios: res.data }))
      .catch(() => toast.error('Erro ao carregar funcionários.'))
      .finally(() => this.setState({ loading: false }))

    // GET /api/setor (para o filtro de setor)
    api.get('/setor')
      .then(res => this.setState({ setores: res.data }))
      .catch(() => {})
  }

  // DELETE /api/funcionario/{id}
  handleDesativar = (id) => {
    api.delete(`/funcionario/${id}`)
      .then(() => {
        toast.success('Funcionário desativado.')
        this.setState({ confirmDelete: null })
        this.carregarDados()
      })
      .catch(() => toast.error('Erro ao desativar funcionário.'))
  }

  limparFiltros = () => {
    this.setState({ filtroNome: '', filtroSetor: '', filtroTurno: '', filtroGenero: '' })
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  getFiltrados() {
    const { funcionarios, filtroNome, filtroSetor, filtroTurno, filtroGenero } = this.state
    return funcionarios.filter(f => {
      const nomeOk   = !filtroNome   || f.nome.toLowerCase().includes(filtroNome.toLowerCase())
      const setorOk  = !filtroSetor  || String(f.setorId) === filtroSetor
      const turnoOk  = !filtroTurno  || f.turno === filtroTurno
      const generoOk = !filtroGenero || f.genero === filtroGenero
      return nomeOk && setorOk && turnoOk && generoOk
    })
  }

  renderRows(filtrados) {
    if (filtrados.length === 0) {
      return (
        <tr>
          <td colSpan={9}>
            <EmptyState
              icon="bi-people"
              title="Nenhum funcionário encontrado"
              description="Ajuste os filtros ou adicione um novo colaborador."
            />
          </td>
        </tr>
      )
    }

    return filtrados.map(f => (
      <tr key={f.id}>
        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{f.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{f.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{f.telefone}</div>
        </td>
        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{f.cpf}</td>
        <td style={{ fontSize: 13 }}>{f.email}</td>
        <td><span className="badge-rh badge-info">{f.nomeSetor ?? '—'}</span></td>
        <td>
          <span className={`badge-rh ${TURNO_BADGE[f.turno] ?? 'badge-info'}`}>
            {TURNO_LABEL[f.turno] ?? f.turno}
          </span>
        </td>
        <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>
          {GENERO_LABEL[f.genero] ?? f.genero}
        </td>
        <td>
          <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 6, color: 'var(--primary-dark)' }}>
            {f.senhaTemporaria}
          </code>
        </td>
        <td>
          <Button variant="light" size="sm" className="btn-edit-rh me-1"
            onClick={() => this.props.router.navigate(`/funcionarios/editar/${f.id}`)}>
            <i className="bi bi-pencil" />
          </Button>
          <Button variant="danger" size="sm" className="btn-danger-rh"
            onClick={() => this.setState({ confirmDelete: f })}>
            <i className="bi bi-trash" />
          </Button>
        </td>
      </tr>
    ))
  }

  render() {
    const { loading, setores, confirmDelete,
            filtroNome, filtroSetor, filtroTurno, filtroGenero,
            funcionarios } = this.state
    const filtrados = this.getFiltrados()

    return (
      <div>
        <PageHeader
          title="Funcionários"
          sub={`${funcionarios.length} colaborador${funcionarios.length !== 1 ? 'es' : ''} cadastrado${funcionarios.length !== 1 ? 's' : ''}`}
          action={
            <Button className="btn-primary-rh"
              onClick={() => this.props.router.navigate('/funcionarios/novo')}>
              <i className="bi bi-plus-lg" /> Adicionar Funcionário
            </Button>
          }
        />

        {/* Filtros */}
        <Card className="filter-bar mb-3">
          <Card.Body>
            <div className="filter-bar-title">Filtros</div>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="form-label-rh">Nome</Form.Label>
                <div className="input-icon-wrap">
                  <i className="bi bi-search" />
                  <Form.Control className="form-control-rh" placeholder="Buscar por nome..."
                    name="filtroNome" value={filtroNome} onChange={this.handleChange} />
                </div>
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh">Setor</Form.Label>
                <Form.Select className="form-control-rh" name="filtroSetor"
                  value={filtroSetor} onChange={this.handleChange}>
                  <option value="">Todos os setores</option>
                  {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="form-label-rh">Turno</Form.Label>
                <Form.Select className="form-control-rh" name="filtroTurno"
                  value={filtroTurno} onChange={this.handleChange}>
                  <option value="">Todos</option>
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                  <option value="noturno">Noturno</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="form-label-rh">Gênero</Form.Label>
                <Form.Select className="form-control-rh" name="filtroGenero"
                  value={filtroGenero} onChange={this.handleChange}>
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="sem_genero">Não informado</option>
                </Form.Select>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="light" className="btn-ghost-rh w-100"
                  onClick={this.limparFiltros} title="Limpar">
                  <i className="bi bi-x-lg" />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tabela */}
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
                    <th>ID</th><th>Nome</th><th>CPF</th><th>Email</th>
                    <th>Setor</th><th>Turno</th><th>Gênero</th>
                    <th>Senha Temp.</th><th style={{ width: 120 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>{this.renderRows(filtrados)}</tbody>
              </Table>
            )}
            <TableFooter shown={filtrados.length} total={funcionarios.length} itemLabel="resultado" />
          </Card.Body>
        </Card>

        <ConfirmModal
          show={!!confirmDelete}
          onHide={() => this.setState({ confirmDelete: null })}
          onConfirm={() => this.handleDesativar(confirmDelete.id)}
          title="Desativar funcionário"
          confirmLabel="Desativar"
          confirmIcon="bi-trash"
        >
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            Tem certeza que deseja desativar <strong>{confirmDelete?.nome}</strong>?
            Ele não conseguirá mais acessar o sistema.
          </p>
        </ConfirmModal>
      </div>
    )
  }
}

export default withRouter(Funcionarios)
