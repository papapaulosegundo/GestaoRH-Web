import { Component } from 'react'
import { Card, Table, Button, Form, Spinner, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withAuth }   from '../../contexts/AuthContext'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, TableFooter } from '../../common/_components'
import { BiSearch, BiX, BiGroup, BiCheckCircle, BiXCircle } from 'react-icons/bi'
import { TURNO_LABEL, TURNO_BADGE, GENERO_LABEL } from '../../common/utils'
import api from '../../services/api'

class FuncionariosSetor extends Component {
  state = {
    funcionarios: [],
    loading:      true,
    filtroNome:   '',
  }

  componentDidMount() { this.carregarDados() }

  carregarDados = () => {
    const { funcionario } = this.props.auth
    if (!funcionario?.setorId) return

    this.setState({ loading: true })
    // Chefe só vê funcionários do próprio setor
    api.get(`/funcionario/setor/${funcionario.setorId}`)
      .then(res => this.setState({ funcionarios: res.data }))
      .catch(() => toast.error('Erro ao carregar equipe.'))
      .finally(() => this.setState({ loading: false }))
  }

  getFiltrados() {
    const { funcionarios, filtroNome } = this.state
    return funcionarios.filter(f =>
      !filtroNome || f.nome.toLowerCase().includes(filtroNome.toLowerCase())
    )
  }

  renderRows(filtrados) {
    if (filtrados.length === 0) {
      return (
        <tr><td colSpan={7}>
          <EmptyState icon={BiGroup} title="Nenhum colaborador encontrado"
            description="Nenhum funcionário ativo no seu setor." />
        </td></tr>
      )
    }

    return filtrados.map(f => (
      <tr key={f.id}>
        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{f.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{f.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{f.telefone}</div>
        </td>
        <td style={{ fontSize: 13 }}>{f.email}</td>
        <td>
          <span className={`badge-rh ${TURNO_BADGE[f.turno] ?? 'badge-info'}`}>
            {TURNO_LABEL[f.turno] ?? f.turno}
          </span>
        </td>
        <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>
          {GENERO_LABEL[f.genero] ?? f.genero}
        </td>
        <td>
          {f.isChefe && (
            <span className="badge-rh badge-info" style={{ fontSize: 11 }}>Chefe</span>
          )}
        </td>
        <td>
          <span className={`badge-rh ${f.ativo ? 'badge-active' : 'badge-inactive'}`}>
            {f.ativo ? <BiCheckCircle className="me-1" /> : <BiXCircle className="me-1" />}
            {f.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
      </tr>
    ))
  }

  render() {
    const { loading, filtroNome, funcionarios } = this.state
    const filtrados = this.getFiltrados()
    const { funcionario } = this.props.auth

    return (
      <div>
        <PageHeader
          title="Equipe do Setor"
          sub={`Setor: ${funcionario?.nomeSetor ?? '—'} — ${funcionarios.length} colaborador${funcionarios.length !== 1 ? 'es' : ''}`}
        />

        <Card className="filter-bar mb-3">
          <Card.Body>
            <div className="filter-bar-title">Filtros</div>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label className="form-label-rh">Nome</Form.Label>
                <div className="input-icon-wrap">
                  <BiSearch size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  <Form.Control className="form-control-rh" placeholder="Buscar por nome..."
                    value={filtroNome} onChange={e => this.setState({ filtroNome: e.target.value })} />
                </div>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="light" className="btn-ghost-rh w-100"
                  onClick={() => this.setState({ filtroNome: '' })}>
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
                    <th>ID</th><th>Nome</th><th>Email</th>
                    <th>Turno</th><th>Gênero</th><th>Papel</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>{this.renderRows(filtrados)}</tbody>
              </Table>
            )}
            <TableFooter shown={filtrados.length} total={funcionarios.length} itemLabel="colaborador" />
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withAuth(withRouter(FuncionariosSetor))
