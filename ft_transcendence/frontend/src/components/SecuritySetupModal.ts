/**
 * TwoFactorSetupModal - Modal para configurar 2FA
 * Componente modular para el setup de 2FA
 */

import { User, TwoFactorSetup } from './AuthenticationForm';

export default class TwoFactorSetupModal {
  private setup: TwoFactorSetup;
  private user: User;
  private modal: HTMLElement | null = null;
  public onSuccess?: (backupCodes: string[]) => void;
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
            <h3>🔐 Setup Two-Factor Authentication</h3>
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
                    onclick="this.select()"
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
                  placeholder="123456" 
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
      
      ${this.renderStyles()}
    `;
  }

  /**
   * Estilos del modal
   */
  private renderStyles(): string {
    return `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
        }
        
        .modal-backdrop {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-container {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
        }
        
        .modal-close:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .modal-content {
          padding: 24px;
        }
        
        .setup-step {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .setup-step:last-child {
          margin-bottom: 0;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-content h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .step-content p {
          margin: 0 0 12px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .qr-container {
          display: flex;
          justify-content: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .qr-image {
          max-width: 200px;
          height: auto;
          border-radius: 8px;
        }
        
        .manual-key-container {
          display: flex;
          gap: 8px;
        }
        
        .manual-key {
          flex: 1;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
          background: #f9fafb;
        }
        
        .copy-btn {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .copy-btn:hover {
          background: #f3f4f6;
        }
        
        .verification-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 18px;
          text-align: center;
          letter-spacing: 4px;
          font-family: monospace;
        }
        
        .verification-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 0 0 12px 12px;
        }
        
        .btn {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
        
        .btn-secondary:hover {
          background: #4b5563;
        }
        
        @media (max-width: 480px) {
          .modal-container {
            margin: 10px;
          }
          
          .setup-step {
            flex-direction: column;
            gap: 12px;
          }
          
          .step-number {
            align-self: flex-start;
          }
        }
      </style>
    `;
  }

  /**
   * Adjuntar event listeners
   */
  private attachEventListeners(element: HTMLElement): void {
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      
      if (action) {
        this.handleAction(action, e);
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
        if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('modal-close')) {
          this.hide();
          if (this.onCancel) {
            this.onCancel();
          }
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
      this.showToast('Copied to clipboard!', 'success');
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Copied to clipboard!', 'success');
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
      this.showToast('Please enter a 6-digit code', 'error');
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
        this.showToast('2FA enabled successfully!', 'success');
        
        setTimeout(() => {
          this.hide();
          if (this.onSuccess) {
            this.onSuccess(data.backupCodes);
          }
        }, 1000);
      } else {
        this.showToast(data.error || 'Invalid verification code', 'error');
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Enable 2FA';
      }
    } catch (error) {
      this.showToast('Network error occurred', 'error');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Enable 2FA';
    }
  }

  /**
   * Mostrar toast notification
   */
  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 2000;
      animation: slideIn 0.3s ease-out;
      ${type === 'success' ? 'background: #059669;' : 'background: #ef4444;'}
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
