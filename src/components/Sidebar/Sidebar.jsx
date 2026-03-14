import { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from '../../common/withRouter'
import { withAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard',    icon: 'bi-grid-1x2',     label: 'Dashboard' },
      { to: '/funcionarios', icon: 'bi-people',        label: 'Funcionários' },
      { to: '/setores',      icon: 'bi-diagram-3',     label: 'Setores' },
    ],
  },
  {
    section: 'Em breve',
    items: [
      { icon: 'bi-file-earmark-text', label: 'Documentos',   disabled: true },
      { icon: 'bi-pen',               label: 'Assinaturas',  disabled: true },
      { icon: 'bi-cloud-upload',      label: 'Uploads',      disabled: true },
      { icon: 'bi-bell',              label: 'Notificações', disabled: true },
      { icon: 'bi-bar-chart-line',    label: 'Relatórios',   disabled: true },
    ],
  },
  {
    section: 'Configurações',
    items: [
      { to: '/empresa', icon: 'bi-building', label: 'Perfil Empresa' },
    ],
  },
]

class Sidebar extends Component {
  handleLogout = () => {
    this.props.auth.logout()
    this.props.router.navigate('/')
  }

  renderNavItem(item) {
    if (item.disabled) {
      return (
        <div key={item.label} className="nav-item disabled">
          <i className={`bi ${item.icon}`} />
          {item.label}
          <span className="nav-badge">Em breve</span>
        </div>
      )
    }
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <i className={`bi ${item.icon}`} />
        {item.label}
      </NavLink>
    )
  }

  render() {
    const { empresa } = this.props.auth
    const iniciais = empresa
      ? `${empresa.responsavelNome?.[0] ?? ''}${empresa.responsavelSobrenome?.[0] ?? ''}`.toUpperCase()
      : 'RH'

    return (
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">📋</div>
          <div>
            <div className="logo-text">GestãoRH</div>
            <div className="logo-sub">Sistema de RH</div>
          </div>
        </div>

        {/* Perfil da empresa */}
        <div className="sidebar-profile">
          <div className="avatar">
            {empresa?.logoBase64
              ? <img src={empresa.logoBase64} alt="Logo" />
              : iniciais}
          </div>
          <div className="profile-info">
            <div className="name">{empresa?.razaoSocial ?? 'Empresa'}</div>
            <div className="role">
              {empresa?.responsavelNome} {empresa?.responsavelSobrenome}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => this.renderNavItem(item))}
            </div>
          ))}
        </nav>

        {/* Footer logout */}
        <div className="sidebar-footer">
          <button className="nav-item" onClick={this.handleLogout} style={{ color: '#F87171' }}>
            <i className="bi bi-box-arrow-left" style={{ color: '#F87171' }} />
            Sair
          </button>
        </div>
      </aside>
    )
  }
}

export default withAuth(withRouter(Sidebar))
