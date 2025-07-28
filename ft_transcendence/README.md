# FT_TRANSCENDENCE

## Table of Contents | Taula de Continguts

- [ENG](#eng) | [CAT](#cat)
- [Microservices Architecture Detailed](#microservices-architecture-detailed)

---

## ENG

```Markdown
#### Major module: Use a framework to build the backend.
In this major module, you are required to use a specific web framework for backend
development: Fastify with Node.js .(1 point) *

#### Minor module: Use a framework or toolkit to build the front-end.
Your frontend development must use the Tailwind CSS in addition of the Type-
script, and nothing else (0.5 point) *

#### Minor module: Use a database for the backend -and more.
The designated database for all DB instances in your project is SQLite This choice
ensure data consistency and compatibility across all project components and may
be a prerequisite for other modules, such as the backend Framework module (0.5 point) *

#### Major module: Standard user management, authentication and users across tour-
naments.
◦ Users can securely subscribe to the website.
◦ Registered users can securely log in.
◦ Users can select a unique display name to participate in tournaments.
◦ Users can update their information.
◦ Users can upload an avatar, with a default option if none is provided.
◦ Users can add others as friends and view their online status.
◦ User profiles display stats, such as wins and losses.
◦ Each user has a Match History including 1v1 games, dates, and relevant
details, accessible to logged-in users. (1 point) *

#### Major module: Implement remote authentication.
In this major module, the goal is to implement the following authentication system:
Google Sign-in .
Surprise.
Key features and objectives include:
◦ Integrate the authentication system, allowing users to securely sign in.
◦ Obtain the necessary credentials and permissions from the authority to enable
secure login.
◦ Implement user-friendly login and authorization flows that adhere to best prac-
tices and security standards.
◦ Ensure the secure exchange of authentication tokens and user information
between the web application and the authentication provider.
This major module aims to provide a remote user authentication, offering users a
secure and convenient way to access the web application. (1 point) X 

#### Major module: Remote players
It should be possible for two players to play remotely. Each player is located on a
separated computer, accessing the same website and playing the same Pong game. (1 point) X

#### Major module: Multiple players
It should be possible to have more than two players. Each player needs live control
(so the “remote players” module is strongly recommended). It’s up to you to decide
how the game could be played with 3, 4, 5, 6 or more players. Along with the regular
2 players game, you can define a specific number of players, greater than 2, for this
multiplayer module. Ex: 4 players could play on a square board, with each player
controlling one unique side of the square. (1 point) X

#### Major module: Add another game with user history and matchmaking.
The goal of this major module, is to introduce a new game, distinct from Pong, and
incorporate features such as user history tracking and matchmaking. Key features
and objectives include:
◦ Develop a new, engaging game to diversify the platform’s offerings and enter-
tain users.
◦ Implement user history tracking to record and display individual users’ game-
play statistics.
◦ Create a matchmaking system to allow users to find opponents and participate
in fair and balanced matches.
◦ Ensure that user game history and matchmaking data are stored securely and
remain up-to-date.
◦ Optimize the performance and responsiveness of the new game to provide an
enjoyable user experience. Regularly update and maintain the game to fix
bugs, add new features, and enhance gameplay.
This major module aims to expand your platform by introducing a new game,
enhancing user engagement with gameplay history, and facilitating matchmaking
for an enjoyable gaming experience. (1 point) X

#### Major module: Introduce an AI opponent.
In this major module, the objective is to incorporate an AI player into the game.
Notably, the use of the A* algorithm is not permitted for this task. Key features
and goals include:
◦ Develop an AI opponent that provides a challenging and engaging gameplay
experience for users.
◦ The AI must replicate human behavior, which means that in your AI imple-
mentation, you must simulate keyboard input. The constraint here is that
the AI can only refresh its view of the game once per second, requiring it to
anticipate bounces and other actions.
The AI must utilize power-ups if you have chosen to implement the
Game customization options module.
◦ Implement AI logic and decision-making processes that enable the AI player
to make intelligent and strategic moves.
◦ Explore alternative algorithms and techniques to create an effective AI player
without relying on A*.
◦ Ensure that the AI adapts to different gameplay scenarios and user interac-
tions. (1 point) X

#### Minor module: GDPR compliance options with user anonymization, local data
management, and account deletion.
The goal of this minor module is to introduce GDPR compliance options that allow
users to exercise their data privacy rights. Key features and objectives include:
◦ Implement GDPR-compliant features that enable users to request anonymiza-
tion of their personal data, ensuring that their identity and sensitive informa-
tion are protected.
◦ Provide tools for users to manage their local data, including the ability to
view, edit, or delete their personal information stored within the system.
◦ Offer a streamlined process for users to request the permanent deletion of
their accounts, including all associated data, ensuring compliance with data
protection regulations.
◦ Maintain clear and transparent communication with users regarding their data
privacy rights, with easily accessible options to exercise these rights.
This minor module aims to enhance user privacy and data protection by offering
GDPR compliance options that empower users to control their personal information
and exercise their data privacy rights within the system.
If you are not familiar with the General Data Protection Regulation (GDPR), it
Surprise.
is essential to understand its principles and implications, especially regarding user
data management and privacy. The GDPR is a regulation that aims to protect the
personal data and privacy of individuals within the European Union (EU) and the
European Economic Area (EEA). It sets out strict rules and guidelines for organi-
zations on how they should handle and process personal data.
To gain a better understanding of the GDPR and its requirements, it is strongly
recommended to visit the official website of the European Commission on data
protection1 . This website provides comprehensive information about the GDPR,
including its principles, objectives, and user rights. It also offers additional re-
sources to delve deeper into the topic and ensure compliance with the regulation.
If you are unfamiliar with the GDPR, please take the time to visit the provided link
and familiarize yourself with the regulations before proceeding with this project. (0.5 points) X

#### Major module: Implement Two-Factor Authentication (2FA) and JWT.
The goal of this major module is to enhance security and user authentication
by introducing Two-Factor Authentication (2FA) and utilizing JSON Web Tokens
(JWT). Key features and objectives include:
◦ Implement Two-Factor Authentication (2FA) as an additional layer of security
for user accounts, requiring users to provide a secondary verification method,
such as a one-time code, in addition to their password.
◦ Utilize JSON Web Tokens (JWT) as a secure method for authentication and
authorization, ensuring that user sessions and access to resources are managed
securely.
◦ Provide a user-friendly setup process for enabling 2FA, with options for SMS
codes, authenticator apps, or email-based verification.
◦ Ensure that JWT tokens are issued and validated securely to prevent unau-
thorized access to user accounts and sensitive data.
This major module aims to strengthen user account security by offering Two-Factor
Authentication (2FA) and enhancing authentication and authorization through the
use of JSON Web Tokens (JWT). (1 points) X

#### Major module: Designing the Backend as Microservices.
The goal of this major module is to architect the backend of the system using a
microservices approach. Key features and objectives include:
◦ Divide the backend into smaller, loosely-coupled microservices, each responsi-
ble for specific functions or features.
◦ Define clear boundaries and interfaces between microservices to enable inde-
pendent development, deployment, and scaling.
◦ Implement communication mechanisms between microservices, such as REST-
ful APIs or message queues, to facilitate data exchange and coordination.
◦ Ensure that each microservice is responsible for a single, well-defined task or
business capability, promoting maintainability and scalability.
This major module aims to enhance the system’s architecture by adopting a mi-
croservices design approach, enabling greater flexibility, scalability, and maintain-
ability of the backend components. (1 points) *

#### Major module: Implementing Advanced 3D Techniques
This major module,"Graphics," focuses on enhancing the visual aspects of the Pong
game. It introduces the use of advanced 3D techniques to create a more immersive
gaming experience. Specifically, the Pong game will be developed using Babylon.js
to achieve the desired visual effects.
◦ Advanced 3D Graphics: The primary goal of this module is to implement
advanced 3D graphics techniques to elevate the visual quality of the Pong
game. By utilizing Babylon.js , the goal is to create stunning visual effects
that immerse players in the gaming environment.
◦ Immersive Gameplay: The incorporation of advanced 3D techniques enhances
the overall gameplay experience by providing users with a visually engaging
and captivating Pong game.
◦ Technology Integration: The chosen technology for this module is Babylon.js .
These tools will be used to create the 3D graphics, ensuring compatibility and
optimal performance.
This major module aims to revolutionize the Pong game’s visual elements by intro-
ducing advanced 3D techniques. Through the use of Babylon.js , we aim to provide
players with an immersive and visually stunning gaming experience. (1 points) *

#### Minor module: Support on all devices.
In this module, the main focus is to ensure that your website works seamlessly on
all types of devices. Key features and objectives include:
◦ Ensure the website is responsive, adapting to different screen sizes and orien-
tations, providing a consistent user experience on desktops, laptops, tablets,
and smartphones.
◦ Ensure that users can easily navigate and interact with the website using
different input methods, such as touchscreens, keyboards, and mice, depending
on the device they are using.
This module aims to provide a consistent and user-friendly experience on all devices,
maximizing accessibility and user satisfaction. (0.5 points) X

#### Minor module: Expanding Browser Compatibility.
In this minor module, the objective is to enhance the compatibility of the web
application by adding support for an additional web browser. Key features and
objectives include:
◦ Extend browser support to include an additional web browser, ensuring that
users can access and use the application seamlessly.
◦ Conduct thorough testing and optimization to ensure that the web application
functions correctly and displays correctly in the newly supported browser.
◦ Address any compatibility issues or rendering discrepancies that may arise in
the added web browser.
◦ Ensure a consistent user experience across all supported browsers, maintaining
usability and functionality.
This minor module aims to broaden the accessibility of the web application by
supporting an additional web browser, providing users with more choices for their
browsing experience. (0.5 points) X

#### Minor module: Multiple language support.
In this minor module, the objective is to ensure that your website supports multiple
languages to cater to a diverse user base. Key features and goals include:
◦ Implement support for a minimum of three languages on the website to ac-
commodate a broad audience.
Surprise.
◦ Provide a language switcher or selector that allows users to easily change the
website’s language based on their preferences.
◦ Translate essential website content, such as navigation menus, headings, and
key information, into the supported languages.
◦ Ensure that users can navigate and interact with the website seamlessly, re-
gardless of the selected language.
◦ Consider using language packs or localization libraries to simplify the transla-
tion process and maintain consistency across different languages.
◦ Allow users to set their preferred language as the default for subsequent visits.
This minor module aims to enhance the accessibility and inclusivity of your website
by offering content in multiple languages, making it more user-friendly for a diverse
international audience. (0.5 points) X

#### Major module: Replace Basic Pong with Server-Side Pong and Implementing an API.
In this major module, the goal is to replace the basic Pong game with a server-
side Pong game, accompanied by the implementation of an API. Key features and
objectives include:
◦ Develop server-side logic for the Pong game to handle gameplay, ball move-
ment, scoring, and player interactions.
◦ Create an API that exposes the necessary resources and endpoints to interact
with the Pong game, allowing partial usage of the game via the Command-Line
Interface (CLI) and web interface.
◦ Design and implement the API endpoints to support game initialization, player
controls, and game state updates.
◦ Ensure that the server-side Pong game is responsive, providing an engaging
and enjoyable gaming experience.
◦ Integrate the server-side Pong game with the web application, allowing users
to play the game directly on the website.
This major module aims to elevate the Pong game by migrating it to the server
side, enabling interaction through both a web interface and CLI while offering an
API for easy access to game resources and features. (1 point) X
```

[↑TOP↑](#table-of-contents--taula-de-continguts)

---

## CAT

```Markdown
#### Mòdul principal: Utilitzar un framework per construir el backend.
En aquest mòdul principal, es requereix utilitzar un framework web específic per al 
desenvolupament del backend: Fastify amb Node.js. (1 punt) *

#### Mòdul menor: Utilitzar un framework o toolkit per construir el front-end.
El desenvolupament del frontend ha d'utilitzar Tailwind CSS a més de Type-
script, i res més (0.5 punts) *

#### Mòdul menor: Utilitzar una base de dades per al backend i més.
La base de dades designada per a totes les instàncies de BD del projecte és SQLite. Aquesta elecció
assegura la consistència i compatibilitat de dades entre tots els components del projecte i pot
ser un prerequisit per a altres mòduls, com el mòdul de Framework del backend (0.5 punts) *

#### Mòdul principal: Gestió d'usuaris estàndard, autenticació i usuaris a través de tornejos.
◦ Els usuaris poden registrar-se de forma segura al lloc web.
◦ Els usuaris registrats poden iniciar sessió de forma segura.
◦ Els usuaris poden seleccionar un nom de visualització únic per participar en tornejos.
◦ Els usuaris poden actualitzar la seva informació.
◦ Els usuaris poden pujar un avatar, amb una opció per defecte si no se'n proporciona cap.
◦ Els usuaris poden afegir altres com a amics i veure el seu estat en línia.
◦ Els perfils d'usuari mostren estadístiques, com victòries i derrotes.
◦ Cada usuari té un Historial de Partides que inclou jocs 1v1, dates i
detalls rellevants, accessible als usuaris amb sessió iniciada. (1 punt) *

#### Mòdul principal: Implementar autenticació remota.
En aquest mòdul principal, l'objectiu és implementar el següent sistema d'autenticació:
Google Sign-in.
Sorpresa.
Les característiques clau i objectius inclouen:
◦ Integrar el sistema d'autenticació, permetent als usuaris iniciar sessió de forma segura.
◦ Obtenir les credencials i permisos necessaris de l'autoritat per habilitar
l'inici de sessió segur.
◦ Implementar fluxos d'inici de sessió i autorització amigables per a l'usuari que s'adhereixin a les millors pràc-
tiques i estàndards de seguretat.
◦ Assegurar l'intercanvi segur de tokens d'autenticació i informació d'usuari
entre l'aplicació web i el proveïdor d'autenticació.
Aquest mòdul principal pretén proporcionar una autenticació d'usuari remota, oferint als usuaris una
forma segura i convenient d'accedir a l'aplicació web. (1 punt) X 

#### Mòdul principal: Jugadors remots
Ha de ser possible que dos jugadors juguin remotament. Cada jugador es troba en un
ordinador separat, accedint al mateix lloc web i jugant al mateix joc de Pong. (1 punt) X

#### Mòdul principal: Múltiples jugadors
Ha de ser possible tenir més de dos jugadors. Cada jugador necessita control en viu
(per tant, el mòdul "jugadors remots" és altament recomanat). Depèn de tu decidir
com es podria jugar el joc amb 3, 4, 5, 6 o més jugadors. Juntament amb el joc regular
de 2 jugadors, pots definir un nombre específic de jugadors, major que 2, per a aquest
mòdul multijugador. Ex: 4 jugadors podrien jugar en un tauler quadrat, amb cada jugador
controlant un costat únic del quadrat. (1 punt) X

#### Mòdul principal: Afegir un altre joc amb historial d'usuari i matchmaking.
L'objectiu d'aquest mòdul principal és introduir un nou joc, diferent del Pong, i
incorporar característiques com el seguiment de l'historial d'usuari i matchmaking. Les característiques clau
i objectius inclouen:
◦ Desenvolupar un nou joc atractiu per diversificar les ofertes de la plataforma i entretenir
els usuaris.
◦ Implementar el seguiment de l'historial d'usuari per registrar i mostrar les estadístiques individuals de joc
dels usuaris.
◦ Crear un sistema de matchmaking per permetre als usuaris trobar oponents i participar
en partides justes i equilibrades.
◦ Assegurar que l'historial de joc d'usuari i les dades de matchmaking s'emmagatzemin de forma segura i
es mantinguin actualitzades.
◦ Optimitzar el rendiment i la capacitat de resposta del nou joc per proporcionar una
experiència d'usuari agradable. Actualitzar i mantenir regularment el joc per arreglar
errors, afegir noves característiques i millorar el gameplay.
Aquest mòdul principal pretén expandir la teva plataforma introduint un nou joc,
millorant el compromís de l'usuari amb l'historial de gameplay, i facilitant el matchmaking
per a una experiència de joc agradable. (1 punt) X

#### Mòdul principal: Introduir un oponent IA.
En aquest mòdul principal, l'objectiu és incorporar un jugador IA al joc.
Notablement, l'ús de l'algoritme A* no està permès per a aquesta tasca. Les característiques clau
i objectius inclouen:
◦ Desenvolupar un oponent IA que proporcioni una experiència de joc desafiadora i atractiva
per als usuaris.
◦ La IA ha de replicar el comportament humà, el que significa que en la teva implementació d'IA, 
has de simular l'entrada de teclat. La restricció aquí és que
la IA només pot refrescar la seva vista del joc una vegada per segon, requerint que
anticipi rebots i altres accions.
La IA ha d'utilitzar power-ups si has escollit implementar el
mòdul d'opcions de personalització del joc.
◦ Implementar lògica d'IA i processos de presa de decisions que permetin al jugador IA
fer moviments intel·ligents i estratègics.
◦ Explorar algoritmes alternatius i tècniques per crear un jugador IA efectiu
sense dependre d'A*.
◦ Assegurar que la IA s'adapti a diferents escenaris de joc i interaccions d'usuari. (1 punt) X

#### Mòdul menor: Opcions de compliment GDPR amb anonimització d'usuari, gestió de dades
locals i eliminació de compte.
L'objectiu d'aquest mòdul menor és introduir opcions de compliment GDPR que permetin
als usuaris exercir els seus drets de privacitat de dades. Les característiques clau i objectius inclouen:
◦ Implementar característiques compatibles amb GDPR que permetin als usuaris sol·licitar l'anonimització
de les seves dades personals, assegurant que la seva identitat i informació sensible
estiguin protegides.
◦ Proporcionar eines per als usuaris per gestionar les seves dades locals, incloent la capacitat de
veure, editar o eliminar la seva informació personal emmagatzemada dins del sistema.
◦ Oferir un procés simplificat per als usuaris per sol·licitar l'eliminació permanent dels
seus comptes, incloent totes les dades associades, assegurant el compliment amb les regulacions
de protecció de dades.
◦ Mantenir una comunicació clara i transparent amb els usuaris sobre els seus drets
de privacitat de dades, amb opcions fàcilment accessibles per exercir aquests drets.
Aquest mòdul menor pretén millorar la privacitat de l'usuari i la protecció de dades oferint
opcions de compliment GDPR que empoderen els usuaris per controlar la seva informació personal
i exercir els seus drets de privacitat de dades dins del sistema.
Si no estàs familiaritzat amb el Reglament General de Protecció de Dades (GDPR), és
Sorpresa.
essencial entendre els seus principis i implicacions, especialment pel que fa a la
gestió de dades d'usuari i privacitat. El GDPR és un reglament que pretén protegir les
dades personals i privacitat dels individus dins de la Unió Europea (UE) i l'
Àrea Econòmica Europea (AEE). Estableix regles i directrius estrictes per a les organitzacions
sobre com han de gestionar i processar les dades personals.
Per obtenir una millor comprensió del GDPR i els seus requisits, és fortament
recomanat visitar el lloc web oficial de la Comissió Europea sobre protecció de dades¹.
Aquest lloc web proporciona informació completa sobre el GDPR,
incloent els seus principis, objectius i drets d'usuari. També ofereix recursos addicionals
per aprofundir en el tema i assegurar el compliment amb el reglament.
Si no estàs familiaritzat amb el GDPR, si us plau pren el temps per visitar l'enllaç proporcionat
i familiaritzar-te amb els reglaments abans de procedir amb aquest projecte. (0.5 punts) X

#### Mòdul principal: Implementar Autenticació de Dos Factors (2FA) i JWT.
L'objectiu d'aquest mòdul principal és millorar la seguretat i l'autenticació d'usuari
introduint l'Autenticació de Dos Factors (2FA) i utilitzant JSON Web Tokens
(JWT). Les característiques clau i objectius inclouen:
◦ Implementar l'Autenticació de Dos Factors (2FA) com una capa addicional de seguretat
per als comptes d'usuari, requerint que els usuaris proporcionin un mètode de verificació secundari,
com un codi d'una sola vegada, a més de la seva contrasenya.
◦ Utilitzar JSON Web Tokens (JWT) com un mètode segur per a l'autenticació i
autorització, assegurant que les sessions d'usuari i l'accés als recursos es gestionin
de forma segura.
◦ Proporcionar un procés de configuració amigable per a l'usuari per habilitar 2FA, amb opcions per a codis SMS,
aplicacions d'autenticació, o verificació basada en correu electrònic.
◦ Assegurar que els tokens JWT s'emetin i validin de forma segura per prevenir l'accés
no autoritzat als comptes d'usuari i dades sensibles.
Aquest mòdul principal pretén enfortir la seguretat del compte d'usuari oferint l'Autenticació
de Dos Factors (2FA) i millorant l'autenticació i autorització a través de l'ús de JSON Web Tokens (JWT). (1 punt) X

#### Mòdul principal: Dissenyar el Backend com a Microserveis.
L'objectiu d'aquest mòdul principal és arquitecturar el backend del sistema utilitzant un
enfocament de microserveis. Les característiques clau i objectius inclouen:
◦ Dividir el backend en microserveis més petits i lleugerament acoblats, cadascun responsable
de funcions o característiques específiques.
◦ Definir límits clars i interfícies entre microserveis per habilitar el
desenvolupament, desplegament i escalat independents.
◦ Implementar mecanismes de comunicació entre microserveis, com APIs RESTful
o cues de missatges, per facilitar l'intercanvi de dades i coordinació.
◦ Assegurar que cada microservei sigui responsable d'una sola tasca ben definida o
capacitat empresarial, promovent la mantenibilitat i escalabilitat.
Aquest mòdul principal pretén millorar l'arquitectura del sistema adoptant un enfocament
de disseny de microserveis, habilitant una major flexibilitat, escalabilitat i mantenibilitat
dels components del backend. (1 punt) *

#### Mòdul principal: Implementar Tècniques 3D Avançades
Aquest mòdul principal, "Gràfics", se centra en millorar els aspectes visuals del joc
de Pong. Introdueix l'ús de tècniques 3D avançades per crear una experiència de joc
més immersiva. Específicament, el joc de Pong es desenvoluparà utilitzant Babylon.js
per aconseguir els efectes visuals desitjats.
◦ Gràfics 3D Avançats: L'objectiu principal d'aquest mòdul és implementar
tècniques de gràfics 3D avançades per elevar la qualitat visual del joc
de Pong. Utilitzant Babylon.js, l'objectiu és crear efectes visuals impressionants
que submergeixi els jugadors en l'entorn de joc.
◦ Gameplay Immersiu: La incorporació de tècniques 3D avançades millora
l'experiència general de gameplay proporcionant als usuaris un joc de Pong
visualment atractiu i captivador.
◦ Integració Tecnològica: La tecnologia escollida per a aquest mòdul és Babylon.js.
Aquestes eines s'utilitzaran per crear els gràfics 3D, assegurant compatibilitat i
rendiment òptim.
Aquest mòdul principal pretén revolucionar els elements visuals del joc de Pong introduint
tècniques 3D avançades. A través de l'ús de Babylon.js, pretenem proporcionar
als jugadors una experiència de joc immersiva i visualment impressionant. (1 punt) *

#### Mòdul menor: Suport en tots els dispositius.
En aquest mòdul, el focus principal és assegurar que el teu lloc web funcioni perfectament en
tots els tipus de dispositius. Les característiques clau i objectius inclouen:
◦ Assegurar que el lloc web sigui responsiu, adaptant-se a diferents mides de pantalla i orientacions,
proporcionant una experiència d'usuari consistent en ordinadors de sobretaula, portàtils, tauletes
i smartphones.
◦ Assegurar que els usuaris puguin navegar fàcilment i interactuar amb el lloc web utilitzant
diferents mètodes d'entrada, com pantalles tàctils, teclats i ratolins, depenent del
dispositiu que estiguin utilitzant.
Aquest mòdul pretén proporcionar una experiència consistent i amigable per a l'usuari en tots els dispositius,
maximitzant l'accessibilitat i la satisfacció de l'usuari. (0.5 punts) X

#### Mòdul menor: Ampliar la Compatibilitat del Navegador.
En aquest mòdul menor, l'objectiu és millorar la compatibilitat de l'aplicació web
afegint suport per a un navegador web adicional. Les característiques clau i
objectius inclouen:
◦ Estendre el suport del navegador per incloure un navegador web adicional, assegurant que
els usuaris puguin accedir i utilitzar l'aplicació sense problemes.
◦ Realitzar proves exhaustives i optimització per assegurar que l'aplicació web
funcioni correctament i es mostri correctament en el navegador nouvament suportat.
◦ Abordar qualsevol problema de compatibilitat o discrepàncies de renderització que puguin sorgir en
el navegador web afegit.
◦ Assegurar una experiència d'usuari consistent en tots els navegadors suportats, mantenint
la usabilitat i funcionalitat.
Aquest mòdul menor pretén ampliar l'accessibilitat de l'aplicació web
suportant un navegador web adicional, proporcionant als usuaris més opcions per a la seva
experiència de navegació. (0.5 punts) X

#### Mòdul menor: Suport multiidioma.
En aquest mòdul menor, l'objectiu és assegurar que el teu lloc web suporti múltiples
idiomes per atendre una base d'usuaris diversa. Les característiques clau i objectius inclouen:
◦ Implementar suport per a un mínim de tres idiomes al lloc web per
acomodar una audiència àmplia.
Sorpresa.
◦ Proporcionar un commutador d'idioma o selector que permeti als usuaris canviar fàcilment
l'idioma del lloc web segons les seves preferències.
◦ Traduir el contingut essencial del lloc web, com menús de navegació, encapçalaments i
informació clau, als idiomes suportats.
◦ Assegurar que els usuaris puguin navegar i interactuar amb el lloc web sense problemes,
independentment de l'idioma seleccionat.
◦ Considerar utilitzar paquets d'idioma o biblioteques de localització per simplificar el
procés de traducció i mantenir la consistència entre diferents idiomes.
◦ Permetre als usuaris establir el seu idioma preferit com a predeterminat per a visites posteriors.
Aquest mòdul menor pretén millorar l'accessibilitat i inclusivitat del teu lloc web
oferint contingut en múltiples idiomes, fent-lo més amigable per a una audiència internacional diversa. (0.5 punts) X

#### Mòdul principal: Reemplaçar el Pong Bàsic amb Pong del Costat del Servidor i Implementar una API.
En aquest mòdul principal, l'objectiu és reemplaçar el joc de Pong bàsic amb un
joc de Pong del costat del servidor, acompanyat de la implementació d'una API. Les característiques clau i
objectius inclouen:
◦ Desenvolupar lògica del costat del servidor per al joc de Pong per gestionar el gameplay, moviment de la pilota,
puntuació i interaccions del jugador.
◦ Crear una API que exposi els recursos necessaris i endpoints per interactuar
amb el joc de Pong, permetent l'ús parcial del joc via la Interfície de Línia de Comandaments (CLI)
i interfície web.
◦ Dissenyar i implementar els endpoints de l'API per suportar la inicialització del joc, controls del jugador
i actualitzacions de l'estat del joc.
◦ Assegurar que el joc de Pong del costat del servidor sigui responsiu, proporcionant una experiència
de joc atractiva i agradable.
◦ Integrar el joc de Pong del costat del servidor amb l'aplicació web, permetent als usuaris
jugar al joc directament al lloc web.
Aquest mòdul principal pretén elevar el joc de Pong migrant-lo al costat del servidor,
habilitant la interacció tant a través d'una interfície web com CLI mentre ofereix una
API per a l'accés fàcil als recursos i característiques del joc. (1 punt) X
```

[↑TOP↑](#table-of-contents--taula-de-continguts)

---

## Microservices Architecture Detailed

### **Main Structure**

```
ft_transcendence/
├── services/
│   ├── api-gateway/          # Single entry point (3001)
│   ├── auth-service/         # JWT Authentication (3002)
│   ├── user-service/         # User/profile management + Friends (3003)
│   ├── game-service/         # Pong logic + WebSockets (3004)
│   └── match-service/        # History/statistics (3005)
├── frontend/                 # React SPA (3000)
├── shared/                   # Shared TypeScript types
├── database/                 # SQLite per service
└── docker-compose.yml        # Complete orchestration
```

### **How the SPA Works**

**1. Communication Flow:**
```
Frontend (React) → API Gateway → Specific Microservice → SQLite
```

**2. Routing & Navigation:**
```typescript
// Frontend routing
/login        → auth-service
/profile      → user-service  
/game         → game-service + WebSockets
/leaderboard  → match-service
```

**3. State Management:**
```typescript
// Context API for global state management
UserContext     → Authenticated user
GameContext     → Current game state
MatchContext    → History and statistics
SocketContext   → WebSocket connections
```

### **Work Distribution (5 People)**

**Person 1: Frontend Lead**
- React SPA + Tailwind CSS
- Routing and navigation
- Shared UI components
- Integration with all services

**Person 2: Auth + User Services**
- `auth-service`: JWT, login/register
- `user-service`: Profiles, avatars
- Session and permission management

**Person 3: Game Engine**
- `game-service`: Pong logic
- Babylon.js 3D rendering
- WebSockets for multiplayer
- Game physics algorithms

**Person 4: Data & Analytics**
- `match-service`: Match history
- Statistics and rankings
- SQLite database design
- Reports and analytics

**Person 5: Infrastructure**
- `api-gateway`: Nginx/Fastify proxy
- Docker + Docker Compose
- CI/CD and deployment

###  **Data Architecture**

**Each service has its own SQLite DB:**
```
auth-service/db/     → users_auth.db        (credentials, tokens)
user-service/db/     → users_profiles.db    (profiles, avatars, friendships)
game-service/db/     → games_state.db       (game states)
match-service/db/    → matches_history.db   (history, statistics)
```

## **Real Workflow Examples**

### **Example: User wants to play a match**

1. **Frontend** → HTTP request to `https://localhost/api/game/create`
2. **API Gateway** → Verifies JWT token with **Auth Service**
3. **API Gateway** → Redirects to **Game Service**
4. **Game Service** → Queries **User Service** for player data
5. **Game Service** → Creates match and establishes WebSocket
6. **Game Service** → Notifies **Match Service** of game start
7. **Match Service** → Updates statistics and notifies friends via User Service

### **Example: User registration**

1. **Frontend** → POST `https://localhost/api/auth/register`
2. **API Gateway** → Redirects to **Auth Service**
3. **Auth Service** → Creates credentials in `users_auth.db`
4. **Auth Service** → Calls **User Service** to create profile
5. **User Service** → Creates profile in `users_profiles.db`
6. **Auth Service** → Generates JWT token
7. **Frontend** → Receives token and redirects to dashboard

### **Example: Real-time game session**

1. **Frontend** → WebSocket connection to `wss://localhost/api/game/ws`
2. **API Gateway** → Proxies WebSocket to **Game Service**
3. **Game Service** → Validates player authentication
4. **Game Service** → Updates game state in `games_state.db`
5. **Game Service** → Broadcasts game events to all players
6. **Game Service** → Sends match events to **Match Service**
7. **Match Service** → Records move history and statistics

### **Architecture Overiview Connections**

┌─────────────────┐    ┌─────────────────┐
│   HTTP (80)     │───▶│   HTTPS (443)   │
│   Redirect      │    │   API Gateway   │
│   Server        │    │   (SSL)         │
└─────────────────┘    └─────────────────┘
                              │
                              │ Routes to:
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Auth Service│    │ User Service│    │ Game Service│
│   (SSL)     │    │   (SSL)     │    │   (SSL)     │
└─────────────┘    └─────────────┘    └─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────┐
│Match Service│    │  Frontend   │
│   (SSL)     │    │  (No SSL)   │
└─────────────┘    └─────────────┘