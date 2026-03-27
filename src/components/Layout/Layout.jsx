import { Component } from 'react'
import { Outlet }    from 'react-router-dom'
import { withRouter } from '../../common/withRouter'
import Sidebar        from '../Sidebar/Sidebar'

const PAGE_TITLES = {
  '/dashboard':              { title: 'Dashboard',         sub: 'Visão geral do sistema' },
  '/funcionarios':           { title: 'Funcionários',       sub: 'Gestão de colaboradores' },
  '/funcionarios/novo':      { title: 'Novo Funcionário',   sub: 'Cadastro de colaborador' },
  '/setores':                { title: 'Setores',            sub: 'Gestão de departamentos' },
  '/setores/novo':           { title: 'Novo Setor',         sub: 'Cadastro de setor' },
  '/empresa':                { title: 'Perfil da Empresa',  sub: 'Informações da sua empresa' },
  '/modelos':                { title: 'Modelos',            sub: 'Modelos de documentos' },
  '/modelos/novo':           { title: 'Novo Modelo',        sub: 'Monte a estrutura do documento' },
  '/documentos':             { title: 'Documentos',         sub: 'Documentos gerados' },
  '/documentos/gerar':       { title: 'Gerar Documento',    sub: 'Crie um novo documento' },
}

class Layout extends Component {
  getPageTitle() {
    const { pathname } = this.props.router.location

    // Rotas com parâmetros dinâmicos — testamos antes das rotas estáticas
    if (/^\/funcionarios\/editar\/\d+$/.test(pathname))
      return { title: 'Editar Funcionário', sub: 'Atualizar dados do colaborador' }
    if (/^\/setores\/editar\/\d+$/.test(pathname))
      return { title: 'Editar Setor', sub: 'Atualizar informações do setor' }
    if (/^\/modelos\/editar\/\d+$/.test(pathname))
      return { title: 'Editar Modelo', sub: 'Atualizar estrutura do documento' }
    if (/^\/documentos\/\d+$/.test(pathname))
      return { title: 'Detalhes do Documento', sub: 'Visualização e assinaturas' }

    // Rotas estáticas
    for (const [path, meta] of Object.entries(PAGE_TITLES)) {
      if (pathname === path || pathname.startsWith(path + '/')) return meta
    }

    return { title: 'GestãoRH', sub: '' }
  }

  render() {
    const { title, sub } = this.getPageTitle()
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <header className="topbar">
            <div className="topbar-title">
              {title}
              {sub && <span className="topbar-sub ms-2">— {sub}</span>}
            </div>
          </header>
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }
}

export default withRouter(Layout)
