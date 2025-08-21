/**
 * TwoFactorComponent - Componente modular de 2FA en TypeScript vanilla
 * Sistema de componentes similar a React pero sin dependencias
 */

export interface User {
  userId: number;
  username: string;
  email: string;
}

export interface TwoFactorState {
  enabled: boolean;
  backupCodesRemaining: number;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
  backupCodes: string[];
}

/**
 * Component principal de 2FA
 */
export class TwoFactorComponent {
  private user: User;
  private state: TwoFactorState;
  private container: HTMLElement;
  private onStateChange?: (state: TwoFactorState) => void;

  constructor(user: User, onStateChange?: (state: TwoFactorState) => void) {
    this.user = user;
    this.onStateChange = onStateChange;
    this.state = {
      enabled: false,
      backupCodesRemaining: 0,
      loading: true,
      error: null,
      success: null
    };
    
    this.container = this.createElement();
    this.loadInitialState();
  }

  /**
   * Crear elemento del componente
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'twofa-component';
    element.innerHTML = this.render();
    this.attachEventListeners(element);
    return element;
  }

  /**
   * Render del componente (similar a React render)
   */
  private render(): string {
    return `
      <div class="twofa-card">
        <div class="twofa-header">
          <h3 class="twofa-title">🔐 Two-Factor Authentication</h3>
          <p class="twofa-description">
            Add an extra layer of security to your account
          </p>
        </div>
        
        <div class="twofa-content">
          ${this.renderContent()}
        </div>
        
        ${this.renderMessages()}
      </div>
      
      ${this.renderStyles()}
    `;
  }

  /**
   * Render del contenido según el estado
   */
  private renderContent(): string {
    if (this.state.loading) {
      return `
        <div class="twofa-loading">
          <div class="spinner"></div>
          <span>Loading 2FA status...</span>
        </div>
      `;
    }

    return `
      <div class="twofa-status">
        <div class="status-info">
          <div class="status-indicator ${this.state.enabled ? 'enabled' : 'disabled'}">
            ${this.state.enabled ? '✅' : '❌'}
          </div>
          <div class="status-text">
            <div class="status-title">
              ${this.state.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div class="status-subtitle">
              ${this.state.enabled 
                ? `${this.state.backupCodesRemaining} backup codes remaining`
                : 'Your account is not protected with 2FA'
              }
            </div>
          </div>
        </div>
        
        <div class="status-actions">
          ${this.renderActions()}
        </div>
      </div>
    `;
  }

  /**
   * Render de las acciones disponibles
   */
  private renderActions(): string {
    if (this.state.enabled) {
      return `
        <button class="btn btn-secondary" data-action="regenerate">
          🔄 Regenerate Codes
        </button>
        <button class="btn btn-danger" data-action="disable">
          ❌ Disable 2FA
        </button>
      `;
    } else {
      return `
        <button class="btn btn-primary" data-action="enable">
          🔐 Enable 2FA
        </button>
      `;
    }
  }

  /**
   * Render de mensajes de error/success
   */
  private renderMessages(): string {
    if (!this.state.error && !this.state.success) return '';

    return `
      <div class="twofa-messages">
        ${this.state.error ? `<div class="message error">${this.state.error}</div>` : ''}
        ${this.state.success ? `<div class="message success">${this.state.success}</div>` : ''}
      </div>
    `;
  }

  /**
   * Estilos del componente
   */
  private renderStyles(): string {
    return `
      <style>
        .twofa-component {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .twofa-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        
        .twofa-header {
          margin-bottom: 20px;
        }
        
        .twofa-title {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 600;
        }
        
        .twofa-description {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .twofa-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 0;
          justify-content: center;
          color: #6b7280;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .twofa-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        
        .status-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .status-indicator {
          font-size: 24px;
        }
        
        .status-indicator.enabled {
          color: #059669;
        }
        
        .status-indicator.disabled {
          color: #ef4444;
        }
        
        .status-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        
        .status-subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        
        .status-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
        }
        
        .btn-danger {
          background: #ef4444;
          color: white;
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .btn-success {
          background: #059669;
          color: white;
        }
        
        .btn-success:hover:not(:disabled) {
          background: #047857;
        }
        
        .twofa-messages {
          margin-top: 16px;
        }
        
        .message {
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .message.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        
        .message.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        
        @media (max-width: 480px) {
          .twofa-status {
            flex-direction: column;
            align-items: stretch;
          }
          
          .status-actions {
            justify-content: center;
          }
        }
      </style>
    `;
  }

  /**
   * Adjuntar event listeners (similar a useEffect)
   */
  private attachEventListeners(element: HTMLElement): void {
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      
      if (action) {
        this.handleAction(action);
      }
    });
  }

  /**
   * Manejar acciones del componente
   */
  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'enable':
        await this.handleEnable2FA();
        break;
      case 'disable':
        await this.handleDisable2FA();
        break;
      case 'regenerate':
        await this.handleRegenerateBackupCodes();
        break;
    }
  }

  /**
   * Cargar estado inicial
   */
  private async loadInitialState(): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        this.setState({
          enabled: data.enabled,
          backupCodesRemaining: data.backupCodesRemaining || 0,
          loading: false,
          error: null
        });
      } else {
        this.setState({
          loading: false,
          error: 'Failed to load 2FA status'
        });
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: 'Network error occurred'
      });
    }
  }

  /**
   * Activar 2FA
   */
  private async handleEnable2FA(): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        const SetupModal = await import('./SecuritySetupModal');
        const modal = new SetupModal.default(data.setup, this.user);
        
        modal.onSuccess = (backupCodes: string[]) => {
          this.setState({
            enabled: true,
            backupCodesRemaining: backupCodes.length,
            success: '2FA has been successfully enabled!'
          });
          this.updateComponent();
        };
        
        modal.show();
      } else {
        this.setState({
          error: data.error || 'Failed to setup 2FA'
        });
        this.updateComponent();
      }
    } catch (error) {
      this.setState({
        error: 'Network error occurred'
      });
      this.updateComponent();
    }
  }

  /**
   * Deshabilitar 2FA
   */
  private async handleDisable2FA(): Promise<void> {
    const DisableModal = await import('./SecurityDisableModal');
    const modal = new DisableModal.default();
    
    modal.onSuccess = () => {
      this.setState({
        enabled: false,
        backupCodesRemaining: 0,
        success: '2FA has been disabled'
      });
      this.updateComponent();
    };
    
    modal.show();
  }

  /**
   * Regenerar códigos de respaldo
   */
  private async handleRegenerateBackupCodes(): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/regenerate-backup-codes', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        const BackupCodesModal = await import('./BackupCodesModal');
        const modal = new BackupCodesModal.default(data.backupCodes);
        
        this.setState({
          backupCodesRemaining: data.backupCodes.length,
          success: 'New backup codes generated'
        });
        
        modal.show();
        this.updateComponent();
      } else {
        this.setState({
          error: data.error || 'Failed to regenerate backup codes'
        });
        this.updateComponent();
      }
    } catch (error) {
      this.setState({
        error: 'Network error occurred'
      });
      this.updateComponent();
    }
  }

  /**
   * Actualizar estado (similar a setState de React)
   */
  private setState(newState: Partial<TwoFactorState>): void {
    this.state = { ...this.state, ...newState };
    
    // Limpiar mensajes después de 5 segundos
    if (newState.error || newState.success) {
      setTimeout(() => {
        this.setState({ error: null, success: null });
        this.updateComponent();
      }, 5000);
    }
    
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  /**
   * Actualizar el componente en el DOM
   */
  private updateComponent(): void {
    this.container.innerHTML = this.render();
    this.attachEventListeners(this.container);
  }

  /**
   * Obtener el elemento DOM del componente
   */
  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Obtener el estado actual
   */
  public getState(): TwoFactorState {
    return { ...this.state };
  }

  /**
   * Refrescar el componente
   */
  public async refresh(): Promise<void> {
    this.setState({ loading: true });
    this.updateComponent();
    await this.loadInitialState();
    this.updateComponent();
  }

  /**
   * Destruir el componente
   */
  public destroy(): void {
    this.container.remove();
  }
}

/**
 * Factory function para crear el componente (más fácil de usar)
 */
export function createTwoFactorComponent(
  user: User, 
  onStateChange?: (state: TwoFactorState) => void
): TwoFactorComponent {
  return new TwoFactorComponent(user, onStateChange);
}
