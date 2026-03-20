import { Component } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { withAuth }   from '../../contexts/AuthContext'
import { withRouter } from '../../common/withRouter'
import { BiGroup, BiFileBlank, BiCheckCircle } from 'react-icons/bi'
import api from '../../services/api'
import { FaPencilAlt } from 'react-icons/fa'

class DashboardFuncionario extends Component {
  state = {
    totalEquipe: 0,
    assinaturasPendentes: 0,
    documentosRecebidos: 0,
    loading: true,
  }

  componentDidMount() {
    const { funcionario, perfil } = this.props.auth
    const isChefe = perfil === 'chefe'

    const promises = [
      // Documentos: em breve — zero por enquanto
      Promise.resolve({ data: [] }),
    ]

    // Chefe carrega equipe do setor
    if (isChefe && funcionario?.setorId) {
      promises.push(api.get(`/funcionario/setor/${funcionario.setorId}`))
    }

    Promise.all(promises)
      .then(([_docs, equipe]) => {
        this.setState({
          totalEquipe:          equipe?.data?.length ?? 0,
          assinaturasPendentes: 0,
          documentosRecebidos:  0,
          loading:              false,
        })
      })
      .catch(() => this.setState({ loading: false }))
  }

  renderChefeCards() {
    const { totalEquipe, assinaturasPendentes } = this.state
    const { funcionario } = this.props.auth
    return [
      { Icon: BiGroup,      label: 'Funcionários no setor',  value: totalEquipe,          color: '#DBEAFE', iconColor: '#2563EB', link: '/fn/equipe' },
      { Icon: FaPencilAlt,  label: 'Assinaturas pendentes',  value: assinaturasPendentes, color: '#FEF3C7', iconColor: '#F59E0B', disabled: true },
      { Icon: BiFileBlank,  label: 'Documentos recebidos',   value: '—',                  color: '#D1FAE5', iconColor: '#10B981', disabled: true },
      { Icon: BiCheckCircle,label: 'Setor',                  value: funcionario?.nomeSetor ?? '—', color: '#EDE9FE', iconColor: '#7C3AED', isText: true },
    ]
  }

  renderFuncionarioCards() {
    const { assinaturasPendentes } = this.state
    return [
      { Icon: FaPencilAlt, label: 'Assinaturas pendentes', value: assinaturasPendentes, color: '#FEF3C7', iconColor: '#F59E0B', disabled: true },
      { Icon: BiFileBlank, label: 'Documentos recebidos',  value: '—',                 color: '#DBEAFE', iconColor: '#2563EB', disabled: true },
    ]
  }

  render() {
    const { funcionario, perfil } = this.props.auth
    const isChefe  = perfil === 'chefe'
    const cards    = isChefe ? this.renderChefeCards() : this.renderFuncionarioCards()
    const nome     = funcionario?.nome?.split(' ')[0] ?? 'Colaborador'

    return (
      <div>
        {/* Saudação */}
        <div className="page-header">
          <div className="page-header-info">
            <h1>Olá, {nome} 👋</h1>
            <p>
              {isChefe
                ? `Chefe do setor ${funcionario?.nomeSetor ?? ''} — confira o resumo da sua equipe.`
                : `Bem-vindo(a) ao seu espaço no GestãoRH.`}
            </p>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="stat-grid">
          {cards.map(c => (
            <div key={c.label} className="stat-card"
              style={{ cursor: (!c.disabled && !c.isText) ? 'pointer' : 'default' }}
              onClick={() => (!c.disabled && !c.isText && c.link) && this.props.router.navigate(c.link)}>
              <div className="stat-icon" style={{ background: c.color }}>
                <c.Icon size={20} color={c.iconColor} />
              </div>
              <div className="stat-value" style={{ fontSize: c.isText ? 16 : undefined }}>
                {c.value}
              </div>
              <div className="stat-label">{c.label}</div>
              {c.disabled && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--gray-400)' }}>Em breve</div>}
            </div>
          ))}
        </div>

        {/* Avisos */}
        <Card className="card-rh">
          <Card.Body className="card-rh-body">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <BiFileBlank size={36} color="var(--primary)" style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>
                Módulo de documentos em construção 🚀
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto' }}>
                Em breve você poderá visualizar e assinar documentos diretamente por aqui.
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withAuth(withRouter(DashboardFuncionario))
