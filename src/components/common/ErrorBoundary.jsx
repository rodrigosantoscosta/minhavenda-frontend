import { Component } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import logger from '../../utils/logger'

/**
 * ErrorBoundary Component
 * 
 * Componente para capturar erros de renderização
 * e exibir uma interface amigável de erro
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack })
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Você pode enviar o erro para um serviço de logging aqui
    // logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-lg w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Ocorreu um erro inesperado
                  </h1>
                  <p className="text-sm text-gray-600">
                    Estamos trabalhando para resolver este problema
                  </p>
                </div>
              </div>

              {/* Detalhes do erro (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-red-900 mb-2">Detalhes do Erro:</h3>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-red-700 font-medium mb-2">
                      Clique para expandir
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>Mensagem:</strong>
                        <p className="text-red-600 font-mono text-xs bg-white p-2 rounded mt-1">
                          {this.state.error?.message || 'Erro desconhecido'}
                        </p>
                      </div>
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </div>
                      {this.state.error?.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                            {this.state.error?.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Ações */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Recarregar Página
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Tentar Novamente
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}