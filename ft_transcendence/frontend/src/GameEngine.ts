/**
 * Main App Class - Aplicació Principal
 * Simplificada després de migració d'autenticació al sistema de routing centralitzat
 */

import { checkAuth, subscribe, setUser as setGlobalUser, getState, setMatch } from './core/state.js';
import { renderGameRoom } from './components/game/GameRoom';
import { quickMatchOnce } from './core/matchmaking'; // sólo usamos quickMatchOnce aquí

export class App {
  constructor() {
    // Subscripció als canvis d'estat
    subscribe(() => {
    });
  }

  public mount(container: HTMLElement): void {
    this.init();
  }

  /**
   * Inicialitzar aplicació
   */
  public async init(): Promise<void> {
    await checkAuth();
  }
}
