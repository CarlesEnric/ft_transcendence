/**
 * TwoFactorSetupModal - Modal para configurar 2FA
 * Componente modular para el setup de 2FA
 */

import { User } from '../../core/state.js';
import { TwoFactorSetup } from './AuthenticationForm.js';
import { showToast } from '../../core/auth-frontend.js';

export default class TwoFactorSetupModal {
  private setup: TwoFactorSetup;
  private user: User;
  private modal: HTMLElement | null = null;
  public onSuccess?: () => void;
  public onCancel?: () => void;

  constructor(setup: TwoFactorSetup, user: User) {
    this.setup = setup;
    this.user = user;
  }

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
    const codeInput = this.modal.querySelector('#verification-code') as HTMLInputElement;
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
            <h3> Setup Two-Factor Authentication</h3>
            <button class="modal-close" data-action="close">×</button>
          </div>
          
          <div class="modal-content">
            <div class="setup-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Scan QR Code</h4>
                <p>Use your authenticator app to scan this QR code:</p>
                <div class="qr-container">
                  <img src="${this.setup.qrCode}" alt="QR Code" class="qr-image">
                </div>
              </div>
            </div>
            
            <div class="setup-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Or Enter Code Manually</h4>
                <div class="manual-key-container">
                  <input 
                    type="text" 
                    value="${this.setup.manualEntryKey}" 
                    readonly 
                    class="manual-key"
                    data-action="select-manual-key"
                  >
                  <button class="copy-btn" data-action="copy-key">📋</button>
                </div>
              </div>
            </div>
            
            <div class="setup-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Enter Verification Code</h4>
                <p>Enter the 6-digit code from your authenticator app:</p>
                <input 
                  type="text" 
                  id="verification-code" 
                  placeholder=" • • • • • • " 
                  maxlength="6"
                  class="verification-input"
                >
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="close">
              Cancel
            </button>
            <button class="btn btn-primary" data-action="verify" id="verify-btn">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
      
    <link rel="stylesheet" href="/styles/setup-modal.css">
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
      // Handle select manual key when clicking the input itself (data-action on input)
      const el = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (el && el.getAttribute('data-action') === 'select-manual-key') {
        const input = el as HTMLInputElement;
        setTimeout(() => input.select(), 0);
      }
    });
    
    // Validar input de código
    const codeInput = element.querySelector('#verification-code') as HTMLInputElement;
    if (codeInput) {
      codeInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/\D/g, '').slice(0, 6);
        
        // Habilitar/deshabilitar botón de verificar
        const verifyBtn = element.querySelector('#verify-btn') as HTMLButtonElement;
        if (verifyBtn) {
          verifyBtn.disabled = target.value.length !== 6;
        }
      });
      
      // Enter para verificar
      codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && codeInput.value.length === 6) {
          this.handleAction('verify', e);
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
        
      case 'copy-key':
        await this.copyToClipboard(this.setup.manualEntryKey);
        break;
        
      case 'verify':
        await this.handleVerify();
        break;
    }
  }

  /**
   * Copiar al portapapeles
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Copied to clipboard!', 'success');
    }
  }

  /**
   * Verificar código 2FA
   */
  private async handleVerify(): Promise<void> {
    const codeInput = this.modal?.querySelector('#verification-code') as HTMLInputElement;
    const verifyBtn = this.modal?.querySelector('#verify-btn') as HTMLButtonElement;
    
    if (!codeInput || !verifyBtn) return;
    
    const code = codeInput.value;
    if (code.length !== 6) {
      showToast('Please enter a 6-digit code', 'error');
      return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    
    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: code,
          secret: this.setup.secret
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('2FA enabled successfully!', 'success');
        setTimeout(() => {
          this.hide();
          if (this.onSuccess) {
            this.onSuccess();
          }
        }, 1000);
      } else {
        showToast(data.error || 'Invalid verification code', 'error');
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Enable 2FA';
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Enable 2FA';
    }
  }
}