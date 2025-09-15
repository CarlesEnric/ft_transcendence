/**
 * TwoFactorBackupCodesModal - Modal para mostrar backup codes
 * Componente modular para mostrar y gestionar códigos de respaldo
 * POTSER ESBORRAR SI NO ES FA SERVEI
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
      
    <link rel="stylesheet" href="/styles/backup-codes-modal.css">
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
