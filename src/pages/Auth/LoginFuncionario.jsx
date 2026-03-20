import { Component }           from 'react'
import { Form, Button, Spinner } from 'react-bootstrap'
import { toast }               from 'react-toastify'
import { withRouter }          from '../../common/withRouter'
import { withAuth }            from '../../contexts/AuthContext'
import { InputWithIcon, FormField } from '../../common/_components'
import { BiIdCard, BiLock }    from 'react-icons/bi'
import { maskCpf }             from '../../common/masks'
import api                     from '../../services/api'

class LoginFuncionario extends Component {
  state = { cpf: '', senha: '', showPwd: false, loading: false }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  enviaLogin = (e) => {
    e.preventDefault()
    const { cpf, senha } = this.state
    if (!cpf || !senha) return toast.error('Preencha CPF e senha.')

    this.setState({ loading: true })
    api.post('/funcionario/login', { cpf, senha })
      .then(res => {
        // A API pode retornar camelCase ou PascalCase dependendo da config do .NET
        // Suportamos ambos para garantir compatibilidade
        const funcData = res.data.funcionario ?? res.data.Funcionario
        const jwt      = res.data.jwt ?? res.data.Jwt

        if (!funcData) {
          toast.error('Erro inesperado no login. Tente novamente.')
          this.setState({ loading: false })
          return
        }

        this.props.auth.loginFuncionario(funcData, jwt)
        toast.success(`Olá, ${funcData.nome?.split(' ')[0] ?? 'Colaborador'}! 👋`)
        this.props.router.navigate('/fn/dashboard')
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'CPF ou senha inválidos.')
        this.setState({ loading: false })
      })
  }

  render() {
    const { cpf, senha, showPwd, loading } = this.state
    return (
      <div className="auth-wrapper">
        <div className="auth-visual">
          <div className="auth-visual-logo">
            <div className="mark">📋</div>
            <div className="brand">GestãoRH</div>
          </div>
          <div className="auth-headline">
            <h2>Área do Colaborador</h2>
            <p>Acesse seus documentos, assinaturas e informações do seu setor.</p>
          </div>
          <div className="auth-features">
            {[
              'Visualize e assine documentos',
              'Acompanhe pendências do seu setor',
              'Acesse seu perfil e dados cadastrais',
              'Notificações em tempo real',
            ].map(f => (
              <div className="auth-feature" key={f}><span className="dot" />{f}</div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 32, position: 'relative', zIndex: 1 }}>
            <a href="/" style={{ fontSize: 13, color: 'var(--gray-400)', textDecoration: 'none' }}>
              ← Acesso RH / Empresa
            </a>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-box">
            <h1>Entrar como colaborador</h1>
            <p className="auth-sub">Use seu CPF e a senha fornecida pelo RH.</p>

            <Form onSubmit={this.enviaLogin} style={{ marginTop: 32 }}>
              <FormField label="CPF" className="form-group-rh">
                <InputWithIcon icon={BiIdCard}>
                  <Form.Control className="form-control-rh" placeholder="000.000.000-00"
                    name="cpf" value={cpf}
                    onChange={e => this.setState({ cpf: maskCpf(e.target.value) })} />
                </InputWithIcon>
              </FormField>

              <FormField label="Senha" className="form-group-rh">
                <InputWithIcon icon={BiLock} showToggle showPwd={showPwd}
                  onToggle={() => this.setState(s => ({ showPwd: !s.showPwd }))}>
                  <Form.Control type={showPwd ? 'text' : 'password'} className="form-control-rh"
                    placeholder="Sua senha" name="senha" value={senha}
                    onChange={this.handleChange} />
                </InputWithIcon>
              </FormField>

              <Button type="submit" className="btn-primary-rh w-100 justify-content-center mt-2" disabled={loading}>
                {loading ? <><Spinner size="sm" className="me-2" />Entrando...</> : 'Entrar'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

export default withAuth(withRouter(LoginFuncionario))