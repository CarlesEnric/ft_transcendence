import i18n from 'i18next';

// Recursos de traducción
const resources = {
  en: {
    translation: {

      // Footer
      "footer.terms": "Terms",
      "footer.privacy": "Privacy",
      "footer.about": "About us",

      // Landing Page
      "landing.title": "Welcome to the most EPIC Pong Game",
      "demo.title": "🏓 Try Pong Demo",
      "demo.subtitle": "Play for 2 minutes free!",
      "demo.playButton": "🎮 Play Demo (2 min)",
      "auth.login": "Login or Register",

      // ✅ Game interface
      'game.player1': 'Player 1',
      'game.demoLevel': 'Demo Level',
      'game.timeLeft': 'Time left',
      'game.playAgain': 'PLAY AGAIN',
      'game.login': 'LOGIN',
      'game.exit': 'Exit',
      'game.aiOpponent': 'AI Opponent',
      'game.easyLevel': 'Easy Level',
      'game.restartConfirm': 'Are you sure you want to restart the game?',
      
      // ✅ Demo expired screen
      'demo.expired': 'Demo Time Expired!',
      'demo.expiredMessage': 'Hope you enjoyed the Pong demo! To continue playing and access all features, register for a free account or log in.',
      'demo.playAgain': '🎮 Play Again',
      'demo.twoMinutes': '(2 min)',
      'demo.registerFree': '🚀 Register Free',
      'demo.unlimited': '(Unlimited)',
      'demo.login': '🔑 Login',
      'demo.existingUser': '(Existing User)',
      'demo.backToHome': '← Back to Home',
      'demo.endConfirm': 'Are you sure you want to end the demo?',

      // ✅ Authentication messages
      'auth.welcome': 'Welcome!',
      'auth.pleaseLogin': 'Please log in to continue.',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.emailPlaceholder': 'Enter your email',
      'auth.passwordPlaceholder': 'Enter your password',
      'auth.loginButton': 'LOGIN',
      'auth.or': 'OR',
      'auth.googleLogin': 'Sign in with Google',
      'auth.noAccount': "Don't have an account?",
      'auth.registerFree': 'Register for free',
      
      // ✅ Common messages
      'common.backToHome': 'Back to Home',

      // ✅ Register specific messages
      'auth.createAccount': 'Create Account',
      'auth.joinUs': 'Join us and start playing!',
      'auth.username': 'Username',
      'auth.usernamePlaceholder': 'Enter your username',
      'auth.confirmPassword': 'Confirm Password',
      'auth.confirmPasswordPlaceholder': 'Confirm your password',
      'auth.registerButton': 'REGISTER',
      'auth.googleRegister': 'Register with Google',
      'auth.haveAccount': 'Already have an account?',
      'auth.signInHere': 'Sign in here',
      
      // ✅ Validation messages
      'auth.passwordMismatch': 'Passwords do not match!',
      'auth.passwordTooShort': 'Password must be at least 6 characters long!',
      'auth.registerSuccess': 'Registration successful! Welcome aboard!',
      'auth.registerError': 'Registration failed. Please try again.',
    
      // Header Component
      "header.level": "Level 1", 
      "header.twoFAEnabled": "2FA is Enabled",
      "header.twoFADisabled": "2FA is Disabled",
      "header.buddiesOnline": "Buddies Online",
      "header.selectMode": "Select mode & ",
      "header.play": "PLAY",
      "header.mode1v1": "1 vs 1",
      "header.mode1vComputer": "1 vs Computer", 
      "header.mode1vOnline": "1 vs Online",
      "header.playNow": "PLAY NOW",
      "header.logout": "Logout",
      "header.settings": "Settings",

      // Ranking Component
      "ranking.title": "Your ranking",
      "ranking.subtitle": "This is your ranking bro.",
      "ranking.tied": "Tied",
      "ranking.win": "Win", 
      "ranking.lose": "Lose",
      "ranking.inviteFriends": "INVITE FRIENDS",
      "ranking.findMatch": "FIND MATCH",

      // Match History Component
      "history.players": "Players",
      "history.date": "Date",
      "history.results": "Results", 
      "history.status": "Status",
      "history.victory": "Victory",
      "history.defeated": "Defeated",

      // Dashboard
      "dashboard.welcome": "Welcome back, {{username}}! 🎮",
      
      // Game Room
      "game.title": "🕹️ Pong Game",
      "game.backToDashboard": "← Back to Dashboard",
      "game.controls": "🕹️ Controls:",
      "game.leftPlayer": "Left Player: ↑↓ Arrow Keys",
      "game.rightPlayer": "Right Player: W/S Keys",
      
      // Demo Expired
      "demo.expired.title": "Demo Time Expired!",
      "demo.expired.message": "Hope you enjoyed the Pong demo! To continue playing and access all features, register for a free account or log in.",
      "demo.expired.playAgain": "🎮 Play Again",
      "demo.expired.register": "🚀 Register Free",
      "demo.expired.login": "🔑 Login",
      "demo.expired.backHome": "← Back to Home",
      
      // Login Page
      "login.title": "Login",
      "login.email": "Email",
      "login.password": "Password",
      "login.submit": "Login",
      "login.noAccount": "Don't have an account?",
      "login.registerLink": "Register here",
      
      // Language Selector
      "language.title": "Idioma",
      "language.english": "English",
      "language.spanish": "Español",
      "language.french": "Français",
      "language.catalan": "Català"
    }
  },
  es: {
    translation: {

      // Footer
      "footer.terms": "Términos",
      "footer.privacy": "Privacidad",
      "footer.about": "Sobre nosotros",

      // Landing Page
      "landing.title": "Bienvenido al juego de Pong más ÉPICO",
      "demo.title": "🏓 Prueba la Demo de Pong",
      "demo.subtitle": "¡Juega gratis por 2 minutos!",
      "demo.playButton": "🎮 Jugar Demo (2 min)",
      "auth.login": "Iniciar Sesión o Registrarse",

      // ✅ Game interface
      'game.player1': 'Jugador 1',
      'game.demoLevel': 'Nivel Demo',
      'game.timeLeft': 'Tiempo restante',
      'game.playAgain': 'JUGAR DE NUEVO',
      'game.login': 'INICIAR SESIÓN',
      'game.exit': 'Salir',
      'game.aiOpponent': 'Oponente IA',
      'game.easyLevel': 'Nivel Fácil',
      'game.restartConfirm': '¿Estás seguro de que quieres reiniciar el juego?',

      // ✅ Demo expired screen
      'demo.expired': '¡Tiempo de Demo Expirado!',
      'demo.expiredMessage': '¡Esperamos que hayas disfrutado la demo de Pong! Para continuar jugando y acceder a todas las funciones, regístrate para una cuenta gratuita o inicia sesión.',
      'demo.playAgain': '🎮 Jugar de Nuevo',
      'demo.twoMinutes': '(2 min)',
      'demo.registerFree': '🚀 Registrarse Gratis',
      'demo.unlimited': '(Ilimitado)',
      'demo.login': '🔑 Iniciar Sesión',
      'demo.existingUser': '(Usuario Existente)',
      'demo.backToHome': '← Volver al Inicio',
      'demo.endConfirm': '¿Estás seguro de que quieres finalizar la demo?',
      
      // ✅ Mensajes de autenticación
      'auth.welcome': '¡Bienvenido!',
      'auth.pleaseLogin': 'Por favor, inicia sesión para continuar.',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.emailPlaceholder': 'Ingresa tu correo electrónico',
      'auth.passwordPlaceholder': 'Ingresa tu contraseña',
      'auth.loginButton': 'INICIAR SESIÓN',
      'auth.or': 'O',
      'auth.googleLogin': 'Iniciar sesión con Google',
      'auth.noAccount': '¿No tienes una cuenta?',
      'auth.registerFree': 'Regístrate gratis',

      // ✅ Mensajes comunes
      'common.backToHome': 'Volver al Inicio',

      // ✅ Mensajes específicos de registro
      'auth.createAccount': 'Crear Cuenta',
      'auth.joinUs': '¡Únete a nosotros y comienza a jugar!',
      'auth.username': 'Nombre de Usuario',
      'auth.usernamePlaceholder': 'Ingresa tu nombre de usuario',
      'auth.confirmPassword': 'Confirmar Contraseña',
      'auth.confirmPasswordPlaceholder': 'Confirma tu contraseña',
      'auth.registerButton': 'REGISTRARSE',
      'auth.googleRegister': 'Registrarse con Google',
      'auth.haveAccount': '¿Ya tienes una cuenta?',
      'auth.signInHere': 'Inicia sesión aquí',
      // ✅ Mensajes de validación
      'auth.passwordMismatch': '¡Las contraseñas no coinciden!',
      'auth.passwordTooShort': '¡La contraseña debe tener al menos 6 caracteres!',
      'auth.registerSuccess': '¡Registro exitoso! ¡Bienvenido a bordo!',
      'auth.registerError': 'Error al registrarse. Por favor, inténtalo de nuevo.',

      // Header
      "header.settings": "Configuración",
      "header.logout": "Cerrar Sesión",
      "header.level": "Nivel 1", 
      "header.twoFAEnabled": "2FA está Activado",
      "header.twoFADisabled": "2FA está Desactivado",
      "header.buddiesOnline": "Amigos en Línea",
      "header.selectMode": "Selecciona modo & ",
      "header.play": "JUGAR",
      "header.mode1v1": "1 vs 1",
      "header.mode1vComputer": "1 vs Computadora", 
      "header.mode1vOnline": "1 vs En Línea",
      "header.playNow": "JUGAR AHORA",

      // Ranking Component
      "ranking.title": "Tu ranking",
      "ranking.subtitle": "Este es tu ranking bro.",
      "ranking.tied": "Empatado",
      "ranking.win": "Victoria", 
      "ranking.lose": "Derrota",
      "ranking.inviteFriends": "INVITAR AMIGOS",
      "ranking.findMatch": "ENCONTRAR PARTIDO",

      // Match History Component
      "history.players": "Jugadores",
      "history.date": "Fecha",
      "history.results": "Resultados", 
      "history.status": "Estado",
      "history.victory": "Victoria",
      "history.defeated": "Derrota",

      // Dashboard
      "dashboard.welcome": "¡Bienvenido de nuevo, {{username}}! 🎮",

      // Game Room
      "game.title": "🕹️ Juego Pong",
      "game.backToDashboard": "← Volver al Dashboard",
      "game.controls": "🕹️ Controles:",
      "game.leftPlayer": "Jugador Izquierdo: Flechas ↑↓",
      "game.rightPlayer": "Jugador Derecho: Teclas W/S",
      
      // Demo Expired
      "demo.expired.title": "¡Demo Expirada!",
      "demo.expired.message": "¡Esperamos que hayas disfrutado la demo de Pong! Para seguir jugando y acceder a todas las funciones, regístrate gratis o inicia sesión.",
      "demo.expired.playAgain": "🎮 Jugar de Nuevo",
      "demo.expired.register": "🚀 Registro Gratis",
      "demo.expired.login": "🔑 Iniciar Sesión",
      "demo.expired.backHome": "← Volver al Inicio",
      
      // Login Page
      "login.title": "Iniciar Sesión",
      "login.email": "Correo Electrónico",
      "login.password": "Contraseña",
      "login.submit": "Entrar",
      "login.noAccount": "¿No tienes una cuenta?",
      "login.registerLink": "Regístrate aquí",
      
      // Language Selector
      "language.title": "Idioma",
      "language.english": "English",
      "language.spanish": "Español",
      "language.french": "Français",
      "language.catalan": "Català"
    }
  },
  fr: {
    translation: {

      // Footer
      "footer.terms": "Conditions",
      "footer.privacy": "Confidentialité",
      "footer.about": "À propos de nous",

      // Landing Page
      "landing.title": "Bienvenue dans le jeu de Pong le plus ÉPIQUE",
      "demo.title": "🏓 Essayez la Démo Pong",
      "demo.subtitle": "Jouez gratuitement pendant 2 minutes !",
      "demo.playButton": "🎮 Jouer Démo (2 min)",
      "auth.login": "Connexion ou Inscription",

      // ✅ Game interface
      'game.player1': 'Joueur 1',
      'game.demoLevel': 'Niveau Démo',
      'game.timeLeft': 'Temps restant',
      'game.playAgain': 'JOUER À NOUVEAU',
      'game.login': 'CONNEXION',
      'game.exit': 'Quitter',
      'game.aiOpponent': 'Adversaire IA',
      'game.easyLevel': 'Niveau Facile',
      'game.restartConfirm': 'Êtes-vous sûr de vouloir redémarrer le jeu ?', 

      // ✅ Demo expired screen
      'demo.expired': 'Temps de Démo Expiré !',
      'demo.expiredMessage': 'J’espère que vous avez apprécié la démo de Pong ! Pour continuer à jouer et accéder à toutes les fonctionnalités, inscrivez-vous pour un compte gratuit ou connectez-vous.',
      'demo.playAgain': '🎮 Jouer à Nouveau',
      'demo.twoMinutes': '(2 min)',
      'demo.registerFree': '🚀 Inscription Gratuite',
      'demo.unlimited': '(Illimité)',
      'demo.login': '🔑 Connexion',
      'demo.existingUser': '(Utilisateur Existant)',
      'demo.backToHome': '← Retour à l\'Accueil',
      'demo.endConfirm': 'Êtes-vous sûr de vouloir terminer la démo ?',

      // ✅ Messages d'authentification
      'auth.welcome': 'Bienvenue !',
      'auth.pleaseLogin': 'Veuillez vous connecter pour continuer.',
      'auth.email': 'E-mail',
      'auth.password': 'Mot de passe',
      'auth.emailPlaceholder': 'Entrez votre e-mail',
      'auth.passwordPlaceholder': 'Entrez votre mot de passe',
      'auth.loginButton': 'SE CONNECTER',
      'auth.or': 'OU',
      'auth.googleLogin': 'Se connecter avec Google',
      'auth.noAccount': "Vous n'avez pas de compte ?",
      'auth.registerFree': 'Inscrivez-vous gratuitement',
      // ✅ Messages communs
      'common.backToHome': 'Retour à l\'Accueil',

      // ✅ Messages spécifiques à l'inscription
      'auth.createAccount': 'Créer un Compte',
      'auth.joinUs': 'Rejoignez-nous et commencez à jouer !',
      'auth.username': 'Nom d\'utilisateur',
      'auth.usernamePlaceholder': 'Entrez votre nom d\'utilisateur',
      'auth.confirmPassword': 'Confirmer le Mot de Passe',
      'auth.confirmPasswordPlaceholder': 'Confirmez votre mot de passe',
      'auth.registerButton': 'S\'INSCRIRE',
      'auth.googleRegister': 'S\'inscrire avec Google',
      'auth.haveAccount': 'Vous avez déjà un compte ?',
      'auth.signInHere': 'Connectez-vous ici',
      // ✅ Messages de validation
      'auth.passwordMismatch': 'Les mots de passe ne correspondent pas !',
      'auth.passwordTooShort': 'Le mot de passe doit comporter au moins 6 caractères !',
      'auth.registerSuccess': 'Inscription réussie ! Bienvenue à bord !',
      'auth.registerError': 'Échec de l\'inscription. Veuillez réessayer.',
      
      // Header Component
      "header.level": "Niveau 1", 
      "header.twoFAEnabled": "2FA est Activé",
      "header.twoFADisabled": "2FA est Désactivé",
      "header.buddiesOnline": "Amis en Ligne",
      "header.selectMode": "Sélectionnez le mode & ",
      "header.play": "JOUER",
      "header.mode1v1": "1 vs 1",
      "header.mode1vComputer": "1 vs Ordinateur", 
      "header.mode1vOnline": "1 vs En Ligne",
      "header.playNow": "JOUER MAINTENANT",
      "header.logout": "Déconnexion",
      "header.settings": "Paramètres",

      // Ranking Component
      "ranking.title": "Votre classement",
      "ranking.subtitle": "Voici votre classement mon pote.",
      "ranking.tied": "Égalité",
      "ranking.win": "Victoire", 
      "ranking.lose": "Défaite",
      "ranking.inviteFriends": "INVITER DES AMIS",
      "ranking.findMatch": "TROUVER UN MATCH",

      // Match History Component
      "history.players": "Joueurs",
      "history.date": "Date",
      "history.results": "Résultats", 
      "history.status": "Statut",
      "history.victory": "Victoire",
      "history.defeated": "Défaite",

      // Dashboard
      "dashboard.welcome": "Bon retour, {{username}} ! 🎮",
      
      // Game Room
      "game.title": "🕹️ Jeu Pong",
      "game.backToDashboard": "← Retour au Tableau de Bord",
      "game.controls": "🕹️ Contrôles :",
      "game.leftPlayer": "Joueur Gauche : Flèches ↑↓",
      "game.rightPlayer": "Joueur Droit : Touches W/S",
      
      // Demo Expired
      "demo.expired.title": "Démo Expirée !",
      "demo.expired.message": "J'espère que vous avez apprécié la démo Pong ! Pour continuer à jouer et accéder à toutes les fonctionnalités, inscrivez-vous gratuitement ou connectez-vous.",
      "demo.expired.playAgain": "🎮 Rejouer",
      "demo.expired.register": "🚀 Inscription Gratuite",
      "demo.expired.login": "🔑 Connexion",
      "demo.expired.backHome": "← Retour à l'Accueil",
      
      // Login Page
      "login.title": "Connexion",
      "login.email": "E-mail",
      "login.password": "Mot de passe",
      "login.submit": "Se connecter",
      "login.noAccount": "Vous n'avez pas de compte ?",
      "login.registerLink": "Inscrivez-vous ici",
      
      // Language Selector
      "language.title": "Idioma",
      "language.english": "English",
      "language.spanish": "Español",
      "language.french": "Français",
      "language.catalan": "Català"
    }
  },
  ca: {
    translation: {
    
      // Footer
      "footer.terms": "Termes",
      "footer.privacy": "Privacitat",
      "footer.about": "Sobre nosaltres",

      // Landing Page
      "landing.title": "Benvingut al joc de Pong més ÈPIC",
      "demo.title": "🏓 Prova la Demo de Pong",
      "demo.subtitle": "Juga gratis durant 2 minuts!",
      "demo.playButton": "🎮 Jugar Demo (2 min)",
      "auth.login": "Iniciar Sessió o Registrar-se",

      // ✅ Game interface
      'game.player1': 'Jugador 1',
      'game.demoLevel': 'Nivell Demo',
      'game.timeLeft': 'Temps restant',
      'game.playAgain': 'JUGAR DE NOU',
      'game.login': 'INICIAR SESSIÓ',
      'game.exit': 'Sortir',
      'game.aiOpponent': 'Oponent IA',
      'game.easyLevel': 'Nivell Fàcil',
      'game.restartConfirm': 'Esteu segur que voleu reiniciar el joc?',

      // ✅ Demo expired screen
      'demo.expired': 'Temps de Demo Expirat!',
      'demo.expiredMessage': 'Esperem que hagis gaudit de la demo de Pong! Per continuar jugant i accedir a totes les funcions, registra\'t per a un compte gratuït o inicia sessió.',
      'demo.playAgain': '🎮 Jugar de Nou',
      'demo.twoMinutes': '(2 min)',
      'demo.registerFree': '🚀 Registrar-se Gratuïtament',
      'demo.unlimited': '(Ilimitat)',
      'demo.login': '🔑 Iniciar Sessió',
      'demo.existingUser': '(Usuari Existente)',
      'demo.backToHome': '← Tornar a l\'Inici',
      'demo.endConfirm': 'Esteu segur que voleu finalitzar la demo?',

      // ✅ Missatges d'autenticació
      "auth.welcome": "Benvingut!",
      "auth.pleaseLogin": "Si us plau, inicia sessió per continuar.",
      "auth.email": "Correu Electrònic",
      "auth.password": "Contrasenya",
      "auth.emailPlaceholder": "Introdueix el teu correu electrònic",
      "auth.passwordPlaceholder": "Introdueix la teva contrasenya",
      "auth.loginButton": "INICIAR SESSIÓ",
      "auth.or": "O",
      "auth.googleLogin": "Iniciar sessió amb Google",
      "auth.noAccount": "No tens un compte?",
      "auth.registerFree": "Registra't gratuïtament",
      // ✅ Missatges comuns
      "common.backToHome": "Tornar a l'Inici",
      
      // ✅ Missatges específics de registre
      "auth.createAccount": "Crear Compte",
      "auth.joinUs": "Uneix-te a nosaltres i comença a jugar!",
      "auth.username": "Nom d'Usuari",
      "auth.usernamePlaceholder": "Introdueix el teu nom d'usuari",
      "auth.confirmPassword": "Confirmar Contrasenya",
      "auth.confirmPasswordPlaceholder": "Confirma la teva contrasenya",
      "auth.registerButton": "REGISTRAR-SE",
      "auth.googleRegister": "Registrar-se amb Google",
      "auth.haveAccount": "Ja tens un compte?",
      "auth.signInHere": "Inicia sessió aquí",
      // ✅ Missatges de validació
      "auth.passwordMismatch": "Les contrasenyes no coincideixen!",
      "auth.passwordTooShort": "La contrasenya ha de tenir almenys 6 caràcters!",
      "auth.registerSuccess": "Registre exitós! Benvingut a bord!",
      "auth.registerError": "Error en el registre. Si us plau, intenta-ho de nou.",
      
     // Header Component
      "header.level": "Nivell 1", 
      "header.twoFAEnabled": "2FA està Activat",
      "header.twoFADisabled": "2FA està Desactivat",
      "header.buddiesOnline": "Amics en Línia",
      "header.selectMode": "Selecciona mode & ",
      "header.play": "JUGAR",
      "header.mode1v1": "1 vs 1",
      "header.mode1vComputer": "1 vs Ordinador", 
      "header.mode1vOnline": "1 vs En Línia",
      "header.playNow": "JUGAR ARA",
      "header.logout": "Tancar Sessió",
      "header.settings": "Configuració",

      // Ranking Component
      "ranking.title": "El teu rànquing",
      "ranking.subtitle": "Aquest és el teu rànquing bro.",
      "ranking.tied": "Empatat",
      "ranking.win": "Victòria", 
      "ranking.lose": "Derrota",
      "ranking.inviteFriends": "INVITAR AMICS",
      "ranking.findMatch": "TROBAR PARTIT",

      // Match History Component
      "history.players": "Jugadors",
      "history.date": "Data",
      "history.results": "Resultats", 
      "history.status": "Estat",
      "history.victory": "Victòria",
      "history.defeated": "Derrota",

      // Dashboard
      "dashboard.welcome": "Benvingut de nou, {{username}}! 🎮",
      
      // Game Room
      "game.title": "🕹️ Joc Pong",
      "game.backToDashboard": "← Tornar al Tauler",
      "game.controls": "🕹️ Controls:",
      "game.leftPlayer": "Jugador Esquerre: Fletxes ↑↓",
      "game.rightPlayer": "Jugador Dret: Tecles W/S",
      
      // Demo Expired
      "demo.expired.title": "Demo Expirada!",
      "demo.expired.message": "Espero que hagis gaudit de la demo de Pong! Per continuar jugant i accedir a totes les funcions, registra't gratuïtament o inicia sessió.",
      "demo.expired.playAgain": "🎮 Jugar de Nou",
      "demo.expired.register": "🚀 Registre Gratuït",
      "demo.expired.login": "🔑 Iniciar Sessió",
      "demo.expired.backHome": "← Tornar a l'Inici",
      
      // Login Page
      "login.title": "Iniciar Sessió",
      "login.email": "Correu Electrònic",
      "login.password": "Contrasenya",
      "login.submit": "Entrar",
      "login.noAccount": "No tens un compte?",
      "login.registerLink": "Registra't aquí",
      
      // Language Selector
      "language.title": "Idioma",
      "language.english": "English",
      "language.spanish": "Español",
      "language.french": "Français",
      "language.catalan": "Català"
    }
  }
};

i18n.init({
  resources,
  lng: localStorage.getItem('preferredLanguage') || 'en', // Idioma por defecto
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React ya escapa por defecto
  }
});

export default i18n;