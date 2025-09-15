/**
 * TwoFactorComponent - Componente modular de 2FA en TypeScript vanilla
 * Sistema de componentes similar a React pero sin dependencias
 */

import { API_CONFIG } from '../config/api';

export interface User {
  id: number;
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
    console.log('🔐 TwoFactorComponent constructor called with user:', user);
    
    this.user = user;
    this.onStateChange = onStateChange;
    this.state = {
      enabled: false,
      backupCodesRemaining: 0,
      loading: true,
      error: null,
      success: null
    };
    
    console.log('🔐 Creating element...');
    this.container = this.createElement();
    console.log('🔐 Element created:', this.container);
    
    console.log('🔐 Loading initial state...');
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
    console.log('🎨 Rendering 2FA component, state:', this.state);
    
    const html = `
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


    <link rel="stylesheet" href="/styles/2fa.css">
    `; // Cargar estils dels components 2fa
    
    console.log('🎨 Generated HTML length:', html.length);
    return html;
  }

  /**
   * Render del contenido según el estado
   */
  private renderContent(): string {
    console.log('🎨 renderContent called, loading:', this.state.loading, 'enabled:', this.state.enabled);
    
    if (this.state.loading) {
      console.log('🎨 Rendering loading state');
      return `
        <div class="twofa-loading">
          <div class="spinner"></div>
          <span>Loading 2FA status...</span>
        </div>
      `;
    }

    console.log('🎨 Rendering main content');
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
    console.log('🎨 renderActions called, enabled:', this.state.enabled);
    
    if (this.state.enabled) {
      console.log('🎨 Rendering enabled actions');
      return `
        <button class="btn btn-secondary" data-action="regenerate">
          🔄 Regenerate Codes
        </button>
        <button class="btn btn-danger" data-action="disable">
          ❌ Disable 2FA
        </button>
      `;
    } else {
      console.log('🎨 Rendering disabled actions');
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
      const response = await fetch(API_CONFIG.AUTH.TWO_FA.STATUS, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('🔄 API response data:', data);
        this.setState({
          enabled: Boolean(data.enabled), // Convert to boolean explicitly
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
      const response = await fetch(API_CONFIG.AUTH.TWO_FA.SETUP, {
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
      const response = await fetch(API_CONFIG.AUTH.TWO_FA.REGENERATE_BACKUP, {
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
    console.log('🔄 setState called with:', newState);
    this.state = { ...this.state, ...newState };
    console.log('🔄 New state:', this.state);
    
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
    
    console.log('🔄 Calling updateComponent...');
    this.updateComponent();
  }

  /**
   * Actualizar el componente en el DOM
   */
  private updateComponent(): void {
    console.log('🔄 updateComponent called');
    const newHTML = this.render();
    console.log('🔄 New HTML generated, length:', newHTML.length);
    this.container.innerHTML = newHTML;
    console.log('🔄 innerHTML updated');
    
    // Re-attach event listeners after updating innerHTML
    this.attachEventListeners(this.container);
    console.log('🔄 Event listeners re-attached');
    
    // Debug: Check if container is actually in DOM
    console.log('🔄 Container parent:', this.container.parentElement);
    console.log('🔄 Container visible:', this.container.offsetWidth > 0 && this.container.offsetHeight > 0);
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
