/**
 * TwoFactorDisableModal - Modal para deshabilitar 2FA
 * Componente modular para deshabilitar 2FA con confirmación
 */

import { showToast } from '../../core/auth-frontend';

export default class TwoFactorDisableModal {
  private modal: HTMLElement | null = null;
  public onSuccess?: () => void;
  public onCancel?: () => void;

  /**
   * Mostrar el modal
   */
  public show(): void {
    if (this.modal) {
      this.hide();
    }

    this.modal = this.createElement();
    document.body.appendChild(this.modal);
    
    // Auto-focus en el input de código
    const codeInput = this.modal.querySelector('#disable-code') as HTMLInputElement;
    if (codeInput) {
      setTimeout(() => codeInput.focus(), 100);
    }
  }

  /**
   * Ocultar el modal
   */
  public hide(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  /**
   * Crear elemento del modal
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'modal-overlay';
    element.innerHTML = this.render();
    this.attachEventListeners(element);
    return element;
  }

  /**
   * Render del modal
   */
  private render(): string {
    return `
      <div class="modal-backdrop" data-action="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3>⚠️ Disable Two-Factor Authentication</h3>
            <button class="modal-close" data-action="close">×</button>
          </div>
          
          <div class="modal-content">
            <div class="warning-section">
              <div class="warning-icon">⚠️</div>
              <div class="warning-content">
                <h4>Security Warning</h4>
                <p>
                  Disabling two-factor authentication will make your account less secure. 
                  You will only need your password to sign in.
                </p>
              </div>
            </div>
            
            <div class="disable-section">
              <h4>Confirm Disable</h4>
              <p>Enter your current 6-digit authentication code to confirm:</p>
              <input 
                type="text" 
                id="disable-code" 
                placeholder=" • • • • • • " 
                maxlength="6"
                class="verification-input"
              >
            </div>
            
            <div class="consequences-section">
              <h4>What happens when you disable 2FA:</h4>
              <ul class="consequences-list">
                <li>Your account will be secured with password only</li>
                <li>Your authenticator app secret will be removed</li>
                <li>You can re-enable 2FA anytime in security settings</li>
              </ul>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="close">
              Cancel
            </button>
            <button class="btn btn-danger" data-action="disable" id="disable-btn">
              Disable 2FA
            </button>
          </div>
        </div>
      </div>
      
    <link rel="stylesheet" href="/styles/disable-modal.css">
    `;
  }

  /**
   * Adjuntar event listeners
   */
  private attachEventListeners(element: HTMLElement): void {
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      
      //  Si és el backdrop (clicar fora), tancar modal
      if (target.classList.contains('modal-backdrop')) {
        this.hide();
        return;
      }
      
      if (action) {
        this.handleAction(action, e);
      }
    });
    
    // Validar input de código
    const codeInput = element.querySelector('#disable-code') as HTMLInputElement;
    if (codeInput) {
      codeInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/\D/g, '').slice(0, 6);
        
        // Habilitar/deshabilitar botón de deshabilitar
        const disableBtn = element.querySelector('#disable-btn') as HTMLButtonElement;
        if (disableBtn) {
          disableBtn.disabled = target.value.length !== 6;
        }
      });
      
      // Enter para deshabilitar
      codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && codeInput.value.length === 6) {
          this.handleAction('disable', e);
        }
      });
    }
  }

  /**
   * Manejar acciones del modal
   */
  private async handleAction(action: string, event: Event): Promise<void> {
    switch (action) {
      case 'close':
        //  Permetre tancar amb botó Cancel, X o clicant fora
        this.hide();
        if (this.onCancel) {
          this.onCancel();
        }
        break;
        
      case 'disable':
        await this.handleDisable();
        break;
    }
  }

  /**
   * Deshabilitar 2FA
   */
  private async handleDisable(): Promise<void> {
    const codeInput = this.modal?.querySelector('#disable-code') as HTMLInputElement;
    const disableBtn = this.modal?.querySelector('#disable-btn') as HTMLButtonElement;
    
    if (!codeInput || !disableBtn) return;
    
    const code = codeInput.value;
    if (code.length !== 6) {
      showToast('Please enter a 6-digit code', 'error');
      return;
    }
    
    disableBtn.disabled = true;
    disableBtn.textContent = 'Disabling...';
    
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('2FA disabled successfully', 'success');
        
        setTimeout(() => {
          this.hide();
          if (this.onSuccess) {
            this.onSuccess();
          }
        }, 1000);
      } else {
        showToast(data.error || 'Invalid verification code', 'error');
        disableBtn.disabled = false;
        disableBtn.textContent = 'Disable 2FA';
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
      disableBtn.disabled = false;
      disableBtn.textContent = 'Disable 2FA';
    }
  }
}
