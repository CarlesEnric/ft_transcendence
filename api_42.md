Per fer servir la API de 42 School per autenticar-se, primer cal entendre el procés que s'ha de seguir. Aquí t'expliquem els passos bàsics que implica l'autenticació en l'API de 42, segons la documentació:

1. Obtenir un Client ID i Client Secret

Quan vulguis accedir a l'API de 42 School, necessitaràs un Client ID i un Client Secret. Aquestes dades les pots obtenir registrant-te a l'API a través del portal de desenvolupadors de 42 (https://profile.intra.42.fr/
).

Els passos per obtenir aquestes credencials són:

Crear un compte a 42 (si encara no el tens).

Accedir a la teva pàgina de perfil i registrar la teva aplicació dins de la secció de API per obtenir el Client ID i el Client Secret.

2. Autenticació OAuth2

L'autenticació es fa mitjançant el protocol OAuth2. Això implica diversos passos:

Passos d'autenticació OAuth2:

Redirigir l'usuari a l'URL d'autorització d'42. L'usuari ha de donar permís a la teva aplicació per accedir a la seva informació.

Un cop l'usuari autoritzi l'aplicació, 42 redirigirà l'usuari a una URL especificada pel teu servidor, amb un codi d'autorització.

El teu servidor haurà de fer una petició POST a l'API de 42 per intercanviar aquest codi d'autorització per un token d'accés.

3. Fluxe de l'Autenticació OAuth2

1. Redirigir l'usuari per autoritzar:

https://api.intra.42.fr/oauth/authorize?client_id=<Client_ID>&redirect_uri=<Your_Redirect_URI>&response_type=code&scope=public


Aquí, substitueixes <Client_ID> pel teu Client ID i <Your_Redirect_URI> per l'URL on vols que l'usuari sigui redirigit després de l'autorització.

2. Intercanviar el codi per un token d'accés:
Un cop l'usuari autoritza, 42 redirigeix a l'URL que has especificat amb el paràmetre code. El teu servidor haurà de fer una petició POST per obtenir un token d'accés:

POST https://api.intra.42.fr/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=<Client_ID>
client_secret=<Client_Secret>
code=<authorization_code>
redirect_uri=<Your_Redirect_URI>
grant_type=authorization_code


3. Rebre el token d'accés:
Si tot ha anat bé, la resposta serà un objecte JSON amb el token d'accés:

{
  "access_token": "<access_token>",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "<refresh_token>"
}

4. Fer peticions a l'API

Un cop tinguis el token d'accés, podràs utilitzar-lo per fer peticions a l'API de 42. Simplement afegeixes el token d'accés a l'encapçalament de les peticions:

GET https://api.intra.42.fr/v2/me
Authorization: Bearer <access_token>

5. Renovar el token d'accés

Els tokens d'accés tenen una durada limitada. Quan caduqui el token, pots utilitzar el refresh token per obtenir un nou access token sense que l'usuari hagi de tornar a passar pel procés d'autenticació:

POST https://api.intra.42.fr/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=<Client_ID>
client_secret=<Client_Secret>
refresh_token=<refresh_token>
grant_type=refresh_token

6. Recomanacions

Seguretat: No comparteixis el teu Client Secret públicament.

Desar el refresh token: Quan obtinguis el refresh token, assegura't de desar-lo de manera segura, ja que permet renovar l'accés sense necessitat de tornar a passar per la validació de l'usuari.
