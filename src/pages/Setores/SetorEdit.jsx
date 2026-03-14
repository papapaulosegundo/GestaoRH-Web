import { Component } from 'react'
import { Card, Form, Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, LoadingSpinner, FormField } from '../../common/_components'
import api from '../../services/api'

class SetorEdit extends Component {
  state = {
    nome: '',
    descricao: '',
    loading: false,
    loadingData: false,
  }

  get isEdit() { return !!this.props.router.params.id }
  get id() { return this.props.router.params.id }

  componentDidMount() {
    if (!this.isEdit) return

    this.setState({ loadingData: true })

    // GET /api/setor/{id}
    api.get(`/setor/${this.id}`)
      .then(res => this.setState({ nome: res.data.nome, descricao: res.data.descricao, loadingData: false }))
      .catch(() => {
        toast.error('Setor não encontrado.')
        this.props.router.navigate('/setores')
      })
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  // POST /api/setor  ou  PUT /api/setor/{id}
  enviaRegistro = (e) => {
    e.preventDefault()
    const { nome, descricao } = this.state

    if (!nome || nome.length < 2) return toast.error('Nome deve ter mínimo 2 caracteres.')

    const payload = { nome, descricao }
    this.setState({ loading: true })

    if (this.isEdit) {
      api.put(`/setor/${this.id}`, payload)
        .then(() => {
          toast.success('Setor atualizado!')
          this.props.router.navigate('/setores')
        })
        .catch(err => {
          toast.error(err.response?.data ?? 'Erro ao atualizar setor.')
          this.setState({ loading: false })
        })
    } else {
      // POST /api/setor
      api.post('/setor', payload)
        .then(() => {
          toast.success('Setor cadastrado!')
          this.props.router.navigate('/setores')
        })
        .catch(err => {
          toast.error(err.response?.data ?? 'Erro ao cadastrar setor.')
          this.setState({ loading: false })
        })
    }
  }

  render() {
    const { nome, descricao, loading, loadingData } = this.state

    if (loadingData) return <LoadingSpinner />

    return (
      <div>
        <PageHeader
          title={this.isEdit ? 'Editar Setor' : 'Novo Setor'} sub={this.isEdit ? 'Atualize as informações do setor.' : 'Cadastre um novo departamento na empresa.'}
          action={
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/setores')}>
                <i className="bi bi-arrow-left" /> Voltar
            </Button>
          }
        />

        <Card className="card-rh" style={{ maxWidth: 600 }}>
          <Card.Body className="card-rh-body">
            <Form onSubmit={this.enviaRegistro}>
              <FormField label="Nome do setor *" className="form-group-rh">
                <Form.Control className="form-control-rh"
                  placeholder="Ex: Recursos Humanos, Financeiro, TI..."
                  name="nome" value={nome} onChange={this.handleChange} required />
              </FormField>

              <FormField
                label="Descrição"
                hint="Ajuda os colaboradores a entenderem onde pertencem."
                className="form-group-rh"
              >
                <Form.Control as="textarea" rows={4} className="form-control-rh"
                  placeholder="Descreva as responsabilidades deste setor..."
                  name="descricao" value={descricao} onChange={this.handleChange}
                  style={{ resize: 'vertical' }} />
              </FormField>

              <div className="d-flex gap-3 justify-content-end mt-2">
                <Button variant="light" className="btn-ghost-rh"
                  onClick={() => this.props.router.navigate('/setores')}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary-rh" disabled={loading}>
                  {loading
                    ? <><Spinner size="sm" className="me-2" />{this.isEdit ? 'Salvando...' : 'Cadastrando...'}</>
                    : <><i className={`bi bi-${this.isEdit ? 'check-lg' : 'plus-lg'}`} />{this.isEdit ? 'Salvar alterações' : 'Cadastrar setor'}</>
                  }
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withRouter(SetorEdit)
