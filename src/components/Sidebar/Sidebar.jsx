import { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from '../../common/withRouter'
import { withAuth } from '../../contexts/AuthContext'
import {
  BiGrid, BiGroup, BiGitBranch, BiFile, BiFileBlank,
  BiCloudUpload, BiBell, BiBarChartAlt2, BiBuilding, BiLogOut
} from 'react-icons/bi'

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard',    Icon: BiGrid,        label: 'Dashboard' },
      { to: '/funcionarios', Icon: BiGroup,        label: 'Funcionários' },
      { to: '/setores',      Icon: BiGitBranch,   label: 'Setores' },
    ]
  },
  {
    section: 'Documentos',
    items: [
      { to: '/modelos',     Icon: BiFile,     label: 'Modelos' },
      { to: '/documentos',  Icon: BiFileBlank, label: 'Documentos' },
    ]
  },
  {
    section: 'Em breve',
    items: [
      { Icon: BiCloudUpload,  label: 'Uploads',      disabled: true },
      { Icon: BiBell,         label: 'Notificações', disabled: true },
      { Icon: BiBarChartAlt2, label: 'Relatórios',   disabled: true },
    ]
  },
  {
    section: 'Configurações',
    items: [
      { to: '/empresa', Icon: BiBuilding, label: 'Perfil Empresa' },
    ]
  }
]

class Sidebar extends Component {
  handleLogout = () => {
    this.props.auth.logout()
    this.props.router.navigate('/')
  }

  render() {
    const { empresa } = this.props.auth
    const iniciais = empresa
      ? `${empresa.responsavelNome?.[0] ?? ''}${empresa.responsavelSobrenome?.[0] ?? ''}`.toUpperCase()
      : 'RH'

    return (
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">📋</div>
          <div>
            <div className="logo-text">GestãoRH</div>
            <div className="logo-sub">Sistema de RH</div>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">
            {empresa?.logoBase64 ? <img src={empresa.logoBase64} alt="Logo" /> : iniciais}
          </div>
          <div className="profile-info">
            <div className="name">{empresa?.razaoSocial ?? 'Empresa'}</div>
            <div className="role">{empresa?.responsavelNome} {empresa?.responsavelSobrenome}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => {
                if (item.disabled) {
                  return (
                    <div key={item.label} className="nav-item disabled">
                      <item.Icon size={16} /> {item.label}
                      <span className="nav-badge">Em breve</span>
                    </div>
                  )
                }
                return (
                  <NavLink key={item.to} to={item.to}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <item.Icon size={16} /> {item.label}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={this.handleLogout} style={{ color: '#F87171' }}>
            <BiLogOut size={16} style={{ color: '#F87171' }} /> Sair
          </button>
        </div>
      </aside>
    )
  }
}

export default withAuth(withRouter(Sidebar))
