1. Inicialitzar un repositori Git

    Comanda: git init

        Crea un nou repositori Git en el directori actual.

        Exemples:

        git init

2. Clonar un repositori existent

    Comanda: git clone <url del repositori>

        Permet clonar un repositori remot a la teva màquina local.

        Exemple:

        git clone https://github.com/usuari/projecte.git

3. Comprovant l'estat del repositori

    Comanda: git status

        Mostra l'estat del repositori: arxius modificats, arxius no seguits, etc.

        Exemple:

        git status

4. Afegir arxius per a la següent versió (commit)

    Comanda: git add <arxiu>

        Afegeix arxius a l'index per preparar-los per al commit.

        Exemple:

git add index.html

Per afegir tots els arxius:

        git add .

5. Fer un commit

    Comanda: git commit -m "Missatge del commit"

        Realitza un commit amb un missatge descriptiu.

        Exemple:

        git commit -m "Afegir funcionalitat de cerca"

6. Veure el historial de commits

    Comanda: git log

        Mostra el historial de commits realitzats en el repositori.

        Exemple:

        git log

7. Treure canvis de l'index (staging area)

    Comanda: git reset <arxiu>

        Si afegeixes un arxiu per error, pots desfer l'afegit.

        Exemple:

        git reset index.html

8. Sincronitzar amb el repositori remot

    Comanda: git pull

        Baixa i integra els canvis del repositori remot.

        Exemple:

        git pull origin main

9. Enviar els teus canvis al repositori remot

    Comanda: git push

        Puja els teus canvis al repositori remot (ex: GitHub, GitLab).

        Exemple:

        git push origin main

10. Crear una nova branca (branch)

    Comanda: git branch <nom de la branca>

        Crea una nova branca, on podràs fer canvis sense afectar la branca principal.

        Exemple:

        git branch nova_funcionalitat

11. Canviar entre branques

    Comanda: git checkout <nom de la branca>

        Canvia a una branca específica.

        Exemple:

    git checkout nova_funcionalitat

O també pots crear i canviar de branca en una sola comanda:

    git checkout -b nova_funcionalitat

12. Fusionar canvis d’una branca a una altra

    Comanda: git merge <nom de la branca>

        Combina els canvis d'una branca a la branca actual.

        Exemple:

        git checkout main
        git merge nova_funcionalitat

13. Visualitzar les diferències entre canvis

    Comanda: git diff

        Mostra les diferències entre l’estat actual dels arxius i l'últim commit.

        Exemple:

        git diff

14. Eliminació de branques

    Comanda: git branch -d <nom de la branca>

        Elimina una branca local.

        Exemple:

    git branch -d nova_funcionalitat

Per eliminar una branca remota:

    git push origin --delete nova_funcionalitat

15. Sincronitzar les branques remotes

    Comanda: git fetch

        Baixa els canvis més recents del repositori remot, però no els fusiona automàticament.

        Exemple:

        git fetch

16. Resoldre conflictes de fusió (merge conflicts)

    Quan fusiones branques amb canvis conflictius, Git et demanarà que resolguis els conflictes manualment editant els arxius.

    Un cop resolts els conflictes, afegeix els arxius resolts amb git add <arxiu> i realitza el commit per completar la fusió.

Bones pràctiques en treballar amb Git en equip:

    Fer commits petits i freqüents: Això facilita la revisió i solució de problemes.

    Utilitzar missatges de commit clars i descriptius: Els missatges de commit han de reflectir el canvi realitzat.

    Crear branques per a noves funcionalitats o correccions: No treballis directament sobre la branca main o master. Això ajuda a mantenir el codi net i sense errors.

    Fer git pull abans de començar a treballar: Així t'assegures que tens l'última versió del codi abans de començar a fer canvis.

    Fer revisió de codi (code reviews): Abans de fusionar canvis importants a la branca principal, és bo que un altre membre de l'equip faci una revisió.

    Resoldre els conflictes ràpidament: Si hi ha conflictes, solucionant-los de seguida evitaràs que el problema s'ampliï.
