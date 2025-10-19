/**
 * TwoFactorComponent - Componente modular de 2FA en TypeScript vanilla
 * Sistema de componentes similar a React pero sin dependencias
 */

import { API_CONFIG } from '../../config/api';
import { User } from '../../core/state';

export interface TwoFactorState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
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
  // ...existing code...
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
    
    const html = `
      <div class="twofa-card">
        <div class="twofa-header">
          <h3 class="twofa-title"> Two-Factor Authentication</h3>
          <p class="twofa-description">
            Add an extra layer of security to your account
          </p>
        </div>
        
        <div class="twofa-content">
          ${this.renderContent()}
        </div>
        
        ${this.renderMessages()}
      </div>


    <link rel="stylesheet" href="/styles/2fa-component.css">
    `; // Cargar estils dels components 2fa
    
    return html;
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
            ${this.state.enabled ? '' : ''}
          </div>
          <div class="status-text">
            <div class="status-title">
              ${this.state.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div class="status-subtitle">
              ${this.state.enabled 
                ? 'Your account is protected with 2FA'
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
  <!-- Regenerate Codes button removed -->
        <button class="btn btn-danger" data-action="disable">
           Disable 2FA
        </button>
      `;
    } else {
      return `
        <button class="btn btn-primary" data-action="enable">
           Enable 2FA
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
  // ...existing code...
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
        this.setState({
          enabled: Boolean(data.enabled), // Convert to boolean explicitly
          // ...existing code...
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
        
        modal.onSuccess = () => {
          this.setState({
            enabled: true,
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
  // ...existing code...
        success: '2FA has been disabled'
      });
      this.updateComponent();
    };
    
    modal.show();
  }

  // ...existing code...

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
    
    this.updateComponent();
  }

  /**
   * Actualizar el componente en el DOM
   */
  private updateComponent(): void {
    const newHTML = this.render();
    this.container.innerHTML = newHTML;
    
    // Re-attach event listeners after updating innerHTML
    this.attachEventListeners(this.container);
    
    // Debug: Check if container is actually in DOM
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
