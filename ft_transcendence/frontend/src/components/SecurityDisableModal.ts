/**
 * TwoFactorDisableModal - Modal para deshabilitar 2FA
 * Componente modular para deshabilitar 2FA con confirmación
 */

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
                placeholder="123456" 
                maxlength="6"
                class="verification-input"
              >
            </div>
            
            <div class="consequences-section">
              <h4>What happens when you disable 2FA:</h4>
              <ul class="consequences-list">
                <li>Your account will be secured with password only</li>
                <li>Your authenticator app secret will be removed</li>
                <li>Your backup codes will be invalidated</li>
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
          color: #dc2626;
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
        
        .warning-section {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .warning-icon {
          font-size: 24px;
          line-height: 1;
        }
        
        .warning-content h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #92400e;
        }
        
        .warning-content p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .disable-section {
          margin-bottom: 24px;
        }
        
        .disable-section h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .disable-section p {
          margin: 0 0 12px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
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
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        .consequences-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .consequences-list {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .consequences-list li {
          margin-bottom: 6px;
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
        
        .btn-danger {
          background: #dc2626;
          color: white;
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #b91c1c;
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
          
          .warning-section {
            flex-direction: column;
            gap: 12px;
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
        if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('modal-close')) {
          this.hide();
          if (this.onCancel) {
            this.onCancel();
          }
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
      this.showToast('Please enter a 6-digit code', 'error');
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
        this.showToast('2FA disabled successfully', 'success');
        
        setTimeout(() => {
          this.hide();
          if (this.onSuccess) {
            this.onSuccess();
          }
        }, 1000);
      } else {
        this.showToast(data.error || 'Invalid verification code', 'error');
        disableBtn.disabled = false;
        disableBtn.textContent = 'Disable 2FA';
      }
    } catch (error) {
      this.showToast('Network error occurred', 'error');
      disableBtn.disabled = false;
      disableBtn.textContent = 'Disable 2FA';
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
