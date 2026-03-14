import { Component } from 'react'
import { Card } from 'react-bootstrap'
import { withRouter } from '../../common/withRouter'
import { PageHeader } from '../../common/_components'
import api from '../../services/api'

const STAT_CARDS = [
  { key: 'funcionarios', icon: 'bi-people-fill', label: 'Funcionários ativos', color: '#DBEAFE', iconColor: '#2563EB', link: '/funcionarios' },
  { key: 'setores', icon: 'bi-diagram-3-fill', label: 'Setores cadastrados', color: '#D1FAE5', iconColor: '#10B981', link: '/setores' },
  { key: null, icon: 'bi-file-earmark-text', label: 'Documentos', color: '#FEF3C7', iconColor: '#F59E0B', disabled: true },
  { key: null, icon: 'bi-pen', label: 'Assinaturas', color: '#EDE9FE', iconColor: '#7C3AED', disabled: true },
]

class Dashboard extends Component {
  state = { funcionarios: 0, setores: 0 }

  componentDidMount() {
    api.get('/funcionario')
      .then(res => this.setState({ funcionarios: res.data.length }))
      .catch(() => {})

    api.get('/setor')
      .then(res => this.setState({ setores: res.data.length }))
      .catch(() => {})
  }

  render() {
    return (
      <div>
        <PageHeader title="Visão Geral" sub="Acompanhe os dados do seu RH em tempo real." />

        <div className="stat-grid">
          {STAT_CARDS.map(c => (
            <div
              key={c.label}
              className="stat-card"
              style={{ cursor: c.disabled ? 'default' : 'pointer' }}
              onClick={() => !c.disabled && this.props.router.navigate(c.link)}
            >
              <div className="stat-icon" style={{ background: c.color }}>
                <i className={`bi ${c.icon}`} style={{ color: c.iconColor }} />
              </div>
              <div className="stat-value">{c.key ? this.state[c.key] : '—'}</div>
              <div className="stat-label">{c.label}</div>
              {c.disabled && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--gray-400)' }}>Em breve</div>}
            </div>
          ))}
        </div>

        <Card className="card-rh">
          <Card.Body className="card-rh-body">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <i className="bi bi-rocket-takeoff" style={{ fontSize: 36, color: 'var(--primary)', display: 'block', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>
                Sistema em construção ...
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto' }}>
                Os módulos de documentos, assinaturas eletrônicas e notificações estão sendo desenvolvidos.
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withRouter(Dashboard)
