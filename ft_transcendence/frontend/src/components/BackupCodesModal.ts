/**
 * TwoFactorBackupCodesModal - Modal para mostrar backup codes
 * Componente modular para mostrar y gestionar códigos de respaldo
 */

export default class TwoFactorBackupCodesModal {
  private backupCodes: string[];
  private modal: HTMLElement | null = null;
  public onClose?: () => void;

  constructor(backupCodes: string[]) {
    this.backupCodes = backupCodes;
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
            <h3>🔑 Backup Recovery Codes</h3>
            <button class="modal-close" data-action="close">×</button>
          </div>
          
          <div class="modal-content">
            <div class="info-section">
              <div class="info-icon">📝</div>
              <div class="info-content">
                <h4>Important: Save These Codes</h4>
                <p>
                  Each backup code can only be used once. Store them safely - 
                  you'll need them to access your account if you lose your authenticator device.
                </p>
              </div>
            </div>
            
            <div class="codes-section">
              <div class="codes-header">
                <h4>Your Backup Codes</h4>
                <div class="codes-actions">
                  <button class="action-btn" data-action="copy-all" title="Copy all codes">
                    📋 Copy All
                  </button>
                  <button class="action-btn" data-action="download" title="Download as text file">
                    💾 Download
                  </button>
                  <button class="action-btn" data-action="print" title="Print codes">
                    🖨️ Print
                  </button>
                </div>
              </div>
              
              <div class="codes-container">
                ${this.renderCodes()}
              </div>
            </div>
            
            <div class="usage-section">
              <h4>How to use backup codes:</h4>
              <ol class="usage-list">
                <li>Go to the login page and enter your username and password</li>
                <li>When prompted for 2FA code, click "Use backup code instead"</li>
                <li>Enter one of these backup codes</li>
                <li>The code will be consumed and cannot be used again</li>
                <li>Generate new codes if you run low</li>
              </ol>
            </div>
            
            <div class="warning-section">
              <div class="warning-icon">⚠️</div>
              <div class="warning-content">
                <strong>Security Notice:</strong> 
                Keep these codes secure and private. Anyone with access to these codes 
                can bypass your two-factor authentication.
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="regenerate">
              Generate New Codes
            </button>
            <button class="btn btn-primary" data-action="close">
              I've Saved These Codes
            </button>
          </div>
        </div>
      </div>
      
      ${this.renderStyles()}
    `;
  }

  /**
   * Render de los códigos
   */
  private renderCodes(): string {
    return this.backupCodes.map((code, index) => `
      <div class="code-item" data-code="${code}">
        <span class="code-number">${(index + 1).toString().padStart(2, '0')}.</span>
        <span class="code-value">${code}</span>
        <button class="code-copy" data-action="copy-single" data-code="${code}" title="Copy this code">
          📋
        </button>
      </div>
    `).join('');
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
          max-width: 600px;
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
        
        .info-section {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .info-icon {
          font-size: 24px;
          line-height: 1;
        }
        
        .info-content h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
        }
        
        .info-content p {
          margin: 0;
          color: #1e40af;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .codes-section {
          margin-bottom: 24px;
        }
        
        .codes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .codes-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .codes-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .codes-container {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }
        
        .code-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        
        .code-number {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          min-width: 24px;
        }
        
        .code-value {
          font-family: monospace;
          font-size: 14px;
          color: #1f2937;
          flex: 1;
          letter-spacing: 1px;
        }
        
        .code-copy {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 2px;
          font-size: 12px;
          opacity: 0.6;
          transition: all 0.2s;
        }
        
        .code-copy:hover {
          opacity: 1;
          background: #f3f4f6;
        }
        
        .usage-section {
          margin-bottom: 24px;
        }
        
        .usage-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .usage-list {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .usage-list li {
          margin-bottom: 8px;
        }
        
        .warning-section {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
        }
        
        .warning-icon {
          font-size: 20px;
          line-height: 1;
        }
        
        .warning-content {
          color: #92400e;
          font-size: 14px;
          line-height: 1.5;
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
        
        @media (max-width: 640px) {
          .modal-container {
            margin: 10px;
          }
          
          .codes-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          
          .codes-actions {
            flex-wrap: wrap;
          }
          
          .codes-container {
            grid-template-columns: 1fr;
          }
          
          .info-section {
            flex-direction: column;
            gap: 12px;
          }
        }
        
        @media print {
          .modal-backdrop {
            background: white;
            position: static;
          }
          
          .modal-container {
            box-shadow: none;
            max-width: none;
            max-height: none;
          }
          
          .modal-header,
          .modal-footer,
          .codes-actions,
          .code-copy {
            display: none;
          }
          
          .codes-container {
            border: 2px solid #000;
            background: white;
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
  }

  /**
   * Manejar acciones del modal
   */
  private async handleAction(action: string, event: Event): Promise<void> {
    switch (action) {
      case 'close':
        if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('modal-close')) {
          this.hide();
          if (this.onClose) {
            this.onClose();
          }
        }
        break;
        
      case 'copy-all':
        await this.copyAllCodes();
        break;
        
      case 'copy-single':
        const code = (event.target as HTMLElement).getAttribute('data-code');
        if (code) {
          await this.copySingleCode(code);
        }
        break;
        
      case 'download':
        this.downloadCodes();
        break;
        
      case 'print':
        window.print();
        break;
        
      case 'regenerate':
        await this.regenerateCodes();
        break;
    }
  }

  /**
   * Copiar todos los códigos
   */
  private async copyAllCodes(): Promise<void> {
    const codesText = this.backupCodes.map((code, index) => 
      `${(index + 1).toString().padStart(2, '0')}. ${code}`
    ).join('\n');
    
    await this.copyToClipboard(codesText);
    this.showToast('All backup codes copied to clipboard!', 'success');
  }

  /**
   * Copiar un código individual
   */
  private async copySingleCode(code: string): Promise<void> {
    await this.copyToClipboard(code);
    this.showToast('Backup code copied!', 'success');
  }

  /**
   * Descargar códigos como archivo de texto
   */
  private downloadCodes(): void {
    const codesText = [
      '# Two-Factor Authentication Backup Codes',
      `# Generated on: ${new Date().toLocaleDateString()}`,
      '# Keep these codes safe and secure!',
      '# Each code can only be used once.',
      '',
      ...this.backupCodes.map((code, index) => 
        `${(index + 1).toString().padStart(2, '0')}. ${code}`
      )
    ].join('\n');
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('Backup codes downloaded!', 'success');
  }

  /**
   * Regenerar códigos de respaldo
   */
  private async regenerateCodes(): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/regenerate-backup-codes', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.backupCodes = data.backupCodes;
        this.updateCodesDisplay();
        this.showToast('New backup codes generated!', 'success');
      } else {
        this.showToast(data.error || 'Failed to regenerate codes', 'error');
      }
    } catch (error) {
      this.showToast('Network error occurred', 'error');
    }
  }

  /**
   * Actualizar la visualización de códigos
   */
  private updateCodesDisplay(): void {
    const codesContainer = this.modal?.querySelector('.codes-container');
    if (codesContainer) {
      codesContainer.innerHTML = this.renderCodes();
    }
  }

  /**
   * Copiar al portapapeles
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
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
