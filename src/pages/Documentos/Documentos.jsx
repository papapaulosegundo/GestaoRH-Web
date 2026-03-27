import { Component } from 'react'
import { Card, Table, Button, Form, Row, Col, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, TableFooter } from '../../common/_components'
import { BiPlus, BiSearch, BiX, BiFileBlank, BiShow } from 'react-icons/bi'
import api from '../../services/api'

const STATUS_BADGE = {
  rascunho:              'badge-warn',
  aguardando_assinatura: 'badge-info',
  parcialmente_assinado: 'badge-warn',
  concluido:             'badge-active',
  cancelado:             'badge-inactive',
}

const STATUS_LABEL = {
  rascunho:              'Rascunho',
  aguardando_assinatura: 'Aguardando assinatura',
  parcialmente_assinado: 'Parcialmente assinado',
  concluido:             'Concluído',
  cancelado:             'Cancelado',
}

class Documentos extends Component {
  state = {
    documentos:  [],
    loading:     true,
    filtroNome:  '',
    filtroStatus: '',
  }

  componentDidMount() { this.carregarDados() }

  carregarDados = () => {
    this.setState({ loading: true })
    // GET /api/documento
    api.get('/documento')
      .then(res => this.setState({ documentos: res.data }))
      .catch(() => toast.error('Erro ao carregar documentos.'))
      .finally(() => this.setState({ loading: false }))
  }

  getFiltrados() {
    const { documentos, filtroNome, filtroStatus } = this.state
    return documentos.filter(d => {
      const nomeOk   = !filtroNome   || d.nomeFuncionario.toLowerCase().includes(filtroNome.toLowerCase()) || d.modeloNome.toLowerCase().includes(filtroNome.toLowerCase())
      const statusOk = !filtroStatus || d.status === filtroStatus
      return nomeOk && statusOk
    })
  }

  renderRows(filtrados) {
    if (filtrados.length === 0) {
      return (
        <tr><td colSpan={7}>
          <EmptyState icon={BiFileBlank}
            title="Nenhum documento encontrado"
            description="Gere o primeiro documento usando um modelo publicado." />
        </td></tr>
      )
    }

    return filtrados.map(d => (
      <tr key={d.id}>
        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{d.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{d.modeloNome}</div>
          {d.loteId && (
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
              Lote #{d.loteId}
            </div>
          )}
        </td>
        <td style={{ fontSize: 13 }}>{d.nomeFuncionario}</td>
        <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{d.nomeSetor}</td>
        <td>
          <span className={`badge-rh ${STATUS_BADGE[d.status] ?? 'badge-info'}`} style={{ fontSize: 11 }}>
            {STATUS_LABEL[d.status] ?? d.status}
          </span>
        </td>
        <td>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: d.assinaturasPendentes > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
              {d.assinaturasPendentes}
            </span>
            <span style={{ color: 'var(--gray-400)' }}> / {d.totalAssinaturas} pendente{d.assinaturasPendentes !== 1 ? 's' : ''}</span>
          </div>
        </td>
        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {new Date(d.criadoEm).toLocaleDateString('pt-BR')}
        </td>
        <td>
          <Button variant="light" size="sm" className="btn-edit-rh"
            onClick={() => this.props.router.navigate(`/documentos/${d.id}`)}>
            <BiShow size={13} />
          </Button>
        </td>
      </tr>
    ))
  }

  render() {
    const { loading, filtroNome, filtroStatus, documentos } = this.state
    const filtrados = this.getFiltrados()

    return (
      <div>
        <PageHeader
          title="Documentos"
          sub={`${documentos.length} documento${documentos.length !== 1 ? 's' : ''} gerado${documentos.length !== 1 ? 's' : ''}`}
          action={
            <Button className="btn-primary-rh"
              onClick={() => this.props.router.navigate('/documentos/gerar')}>
              <BiPlus className="me-1" /> Gerar Documento
            </Button>
          }
        />

        <Card className="filter-bar mb-3">
          <Card.Body>
            <div className="filter-bar-title">Filtros</div>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label className="form-label-rh">Funcionário / Modelo</Form.Label>
                <div className="input-icon-wrap">
                  <BiSearch size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  <Form.Control className="form-control-rh" placeholder="Buscar por funcionário ou modelo..."
                    value={filtroNome} onChange={e => this.setState({ filtroNome: e.target.value })} />
                </div>
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh">Status</Form.Label>
                <Form.Select className="form-control-rh"
                  value={filtroStatus} onChange={e => this.setState({ filtroStatus: e.target.value })}>
                  <option value="">Todos</option>
                  {Object.entries(STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="light" className="btn-ghost-rh w-100"
                  onClick={() => this.setState({ filtroNome: '', filtroStatus: '' })}>
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
                    <th>ID</th><th>Modelo</th><th>Funcionário</th><th>Setor</th>
                    <th>Status</th><th>Assinaturas</th><th>Criado em</th><th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>{this.renderRows(filtrados)}</tbody>
              </Table>
            )}
            <TableFooter shown={filtrados.length} total={documentos.length} itemLabel="documento" />
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withRouter(Documentos)
