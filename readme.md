<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

<!--|deDE:Projektstatus-->
<!--|frFR:État du projet-->
Project status
--------------

[![npm](https://img.shields.io/npm/v/ejs-web-node-plugin?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/ejs-web-node-plugin)
[![npm downloads](https://img.shields.io/npm/dy/ejs-web-node-plugin.svg?style=for-the-badge)](https://www.npmjs.com/package/ejs-web-node-plugin)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/build.yaml?style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/ejs-web-node-plugin?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/ejs-web-node-plugin)

[![deploy web documentation](https://img.shields.io/github/actions/workflow/status/thaibault/ejs-web-node-plugin/deploy-web-documentation.yaml?label=deploy%20web%20documentation&style=for-the-badge)](https://github.com/thaibault/ejs-web-node-plugin/actions/workflows/deploy-web-documentation.yaml)
[![web documentation](https://img.shields.io/website-up-down-green-red/https/tsickert.com/ejs-web-node-plugin.svg?label=web-documentation&style=for-the-badge)](https://tsickert.com/ejs-web-node-plugin)

<!--|deDE:Einsatzmöglichkeiten-->
<!--|frFR:Cas d'utilisation-->
Use case
--------

This [web-node](https://tsickert.com/web-node) plugin renders
[EJS](https://ejs.co) templates found in your application into static files.
Templates have access to the complete web-node configuration, so you can
generate e.g. configuration files for other services, static HTML pages or
scripts from one central configuration.
<!--deDE:
    Dieses [web-node](https://tsickert.com/web-node)-Plugin rendert
    [EJS](https://ejs.co)-Vorlagen Ihrer Anwendung in statische Dateien.
    Vorlagen haben Zugriff auf die komplette web-node-Konfiguration, sodass
    Sie z. B. Konfigurationsdateien für andere Dienste, statische HTML-Seiten
    oder Skripte aus einer zentralen Konfiguration erzeugen können.
-->
<!--frFR:
    Ce plugin [web-node](https://tsickert.com/web-node) génère des fichiers
    statiques à partir des modèles [EJS](https://ejs.co) de votre application.
    Les modèles ont accès à toute la configuration web-node, ce qui permet de
    générer par exemple des fichiers de configuration pour d'autres services,
    des pages HTML statiques ou des scripts à partir d'une configuration
    centrale.
-->

Features included:
<!--deDE:Enthaltene Funktionen:-->
<!--frFR:Fonctionnalités incluses:-->

- Renders every "*.ejs" file next to itself without the extension, e.g.
  "nginx.conf.ejs" becomes "nginx.conf".<!--deDE:Rendert jede "*.ejs"-Datei neben sich selbst ohne die Endung, z. B. wird "nginx.conf.ejs" zu "nginx.conf".--><!--frFR:Génère chaque fichier "*.ejs" à côté de lui-même sans l'extension, par exemple "nginx.conf.ejs" devient "nginx.conf".-->
- In-place replacement of files which are templates themselves.<!--deDE:Ersetzung an Ort und Stelle für Dateien, die selbst Vorlagen sind.--><!--frFR:Remplacement sur place pour les fichiers qui sont eux-mêmes des modèles.-->
- Nested includes with their own local variables.<!--deDE:Verschachtelte Includes mit eigenen lokalen Variablen.--><!--frFR:Inclusions imbriquées avec leurs propres variables locales.-->
- Configurable template scope with utilities, evaluated expressions and
  plain values.<!--deDE:Konfigurierbarer Vorlagen-Scope mit Hilfsfunktionen, ausgewerteten Ausdrücken und einfachen Werten.--><!--frFR:Portée de modèle configurable avec utilitaires, expressions évaluées et valeurs simples.-->
- Re-rendering after configuration changes and removal of generated files on
  shutdown.<!--deDE:Erneutes Rendern nach Konfigurationsänderungen und Entfernen generierter Dateien beim Beenden.--><!--frFR:Nouveau rendu après modification de la configuration et suppression des fichiers générés à l'arrêt.-->

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

Installation
------------

Install the plugin next to web-node. web-node discovers every installed
package whose name ends with "-web-node-plugin" automatically:
<!--deDE:
    Installieren Sie das Plugin neben web-node. web-node erkennt jedes
    installierte Paket, dessen Name auf "-web-node-plugin" endet,
    automatisch:
-->
<!--frFR:
    Installez le plugin à côté de web-node. web-node détecte automatiquement
    chaque paquet installé dont le nom se termine par "-web-node-plugin":
-->

```bash
yarn add web-node ejs-web-node-plugin
```

<!--|deDE:Beispiel-->
<!--|frFR:Exemple-->
Example
-------

All values of the scope are available via the locals name "_". A template
"greeting.txt.ejs" in your application directory:
<!--deDE:
    Alle Werte des Scopes sind über den Namen "_" verfügbar. Eine Vorlage
    "greeting.txt.ejs" in Ihrem Anwendungsverzeichnis:
-->
<!--frFR:
    Toutes les valeurs de la portée sont accessibles via le nom "_". Un
    modèle "greeting.txt.ejs" dans le répertoire de votre application:
-->

```EJS
Hello from <%- _.configuration.name %>!

Rendered at <%- _.now.toISOString() %>.

<%- await _.include('footer.txt', {year: _.now.getFullYear()}) %>
```

Enable rendering on startup and after configuration updates in your
application's "package.json". The result is written to "greeting.txt":
<!--deDE:
    Aktivieren Sie das Rendern beim Start und nach Konfigurationsänderungen in
    der "package.json" Ihrer Anwendung. Das Ergebnis wird nach
    "greeting.txt" geschrieben:
-->
<!--frFR:
    Activez le rendu au démarrage et après chaque mise à jour de la
    configuration dans le "package.json" de votre application. Le résultat est
    écrit dans "greeting.txt":
-->

```JSON
{
    "webNode": {
        "ejs": {
            "renderAfterConfigurationUpdates": true
        }
    }
}
```

Without this option nothing is rendered automatically. Other plugins can then
trigger rendering via "services.ejs.render(state)".
<!--deDE:
    Ohne diese Option wird nichts automatisch gerendert. Andere Plugins können
    das Rendern dann über "services.ejs.render(state)" auslösen.
-->
<!--frFR:
    Sans cette option, rien n'est généré automatiquement. D'autres plugins
    peuvent alors déclencher le rendu via "services.ejs.render(state)".
-->

<!--|deDE:Konfiguration-->
<!--|frFR:Configuration-->
Configuration
-------------

All options live below "webNode.ejs":
<!--deDE:Alle Optionen liegen unterhalb von "webNode.ejs":-->
<!--frFR:Toutes les options se trouvent sous "webNode.ejs":-->

- "extensions": File endings to treat as templates. Defaults to ".ejs" and
  ".html.js".<!--deDE:"extensions": Dateiendungen, die als Vorlagen behandelt werden. Standardmäßig ".ejs" und ".html.js".--><!--frFR:"extensions": Extensions de fichier traitées comme modèles. Par défaut ".ejs" et ".html.js".-->
- "locations.include" and "locations.exclude": Directories to search and to
  skip. "node_modules", "src", "log", "database" and similar folders are
  excluded by default.<!--deDE:"locations.include" und "locations.exclude": Zu durchsuchende und auszulassende Verzeichnisse. "node_modules", "src", "log", "database" und ähnliche Ordner sind standardmäßig ausgeschlossen.--><!--frFR:"locations.include" et "locations.exclude": Répertoires à parcourir et à ignorer. "node_modules", "src", "log", "database" et des dossiers similaires sont exclus par défaut.-->
- "locations.inPlaceReplacements": Files rendered into themselves instead of
  a new file.<!--deDE:"locations.inPlaceReplacements": Dateien, die in sich selbst statt in eine neue Datei gerendert werden.--><!--frFR:"locations.inPlaceReplacements": Fichiers générés dans eux-mêmes au lieu d'un nouveau fichier.-->
- "cache" and "cacheInPlaceReplacements": Skip rendering if a result already
  exists.<!--deDE:"cache" und "cacheInPlaceReplacements": Überspringen das Rendern, wenn bereits ein Ergebnis existiert.--><!--frFR:"cache" et "cacheInPlaceReplacements": Ignorent le rendu si un résultat existe déjà.-->
- "options": Options passed to [EJS](https://ejs.co/#docs), e.g. "localsName"
  (default "_").<!--deDE:"options": Optionen für [EJS](https://ejs.co/#docs), z. B. "localsName" (standardmäßig "_").--><!--frFR:"options": Options transmises à [EJS](https://ejs.co/#docs), par exemple "localsName" (par défaut "_").-->
- "scope": Values available in templates. "plain" holds static values,
  "evaluation" and "execution" hold JavaScript expressions and statements
  evaluated once per rendering ("async_*" variants may be awaited). By default
  configuration, plugins, "now" and the clientnode utilities ("array",
  "string", "object", …) are provided.<!--deDE:"scope": In Vorlagen verfügbare Werte. "plain" enthält statische Werte, "evaluation" und "execution" enthalten JavaScript-Ausdrücke und -Anweisungen, die einmal pro Rendervorgang ausgewertet werden ("async_*"-Varianten dürfen asynchron sein). Standardmäßig stehen Konfiguration, Plugins, "now" und die clientnode-Hilfsfunktionen ("array", "string", "object", …) bereit.--><!--frFR:"scope": Valeurs disponibles dans les modèles. "plain" contient des valeurs statiques, "evaluation" et "execution" contiennent des expressions et instructions JavaScript évaluées une fois par rendu (les variantes "async_*" peuvent être asynchrones). Par défaut, la configuration, les plugins, "now" et les utilitaires clientnode ("array", "string", "object", …) sont fournis.-->
- "renderAfterConfigurationUpdates": Render on startup and after each
  configuration change. Defaults to "false".<!--deDE:"renderAfterConfigurationUpdates": Beim Start und nach jeder Konfigurationsänderung rendern. Standardmäßig "false".--><!--frFR:"renderAfterConfigurationUpdates": Générer au démarrage et après chaque modification de la configuration. Par défaut "false".-->
- "reloadEntryFiles" and "reloadSourceContent": Search templates and read
  their content again on each rendering.<!--deDE:"reloadEntryFiles" und "reloadSourceContent": Vorlagen bei jedem Rendern erneut suchen und ihren Inhalt neu einlesen.--><!--frFR:"reloadEntryFiles" et "reloadSourceContent": Rechercher les modèles et relire leur contenu à chaque rendu.-->

<!--|deDE:Hooks und Dienste-->
<!--|frFR:Hooks et services-->
Hooks and services
------------------

- "preEjsRender": Runs before rendering. Return modified "entryFiles" or
  "scope".<!--deDE:"preEjsRender": Läuft vor dem Rendern. Geben Sie geänderte "entryFiles" oder einen geänderten "scope" zurück.--><!--frFR:"preEjsRender": S'exécute avant le rendu. Retournez des "entryFiles" ou une "scope" modifiés.-->
- "postEjsRender": Runs after all templates are written.<!--deDE:"postEjsRender": Läuft, nachdem alle Vorlagen geschrieben wurden.--><!--frFR:"postEjsRender": S'exécute après l'écriture de tous les modèles.-->
- "services.ejs.render": Triggers rendering of all templates.<!--deDE:"services.ejs.render": Löst das Rendern aller Vorlagen aus.--><!--frFR:"services.ejs.render": Déclenche le rendu de tous les modèles.-->
- "services.ejs.renderFactory": Creates a render function for single files.<!--deDE:"services.ejs.renderFactory": Erzeugt eine Renderfunktion für einzelne Dateien.--><!--frFR:"services.ejs.renderFactory": Crée une fonction de rendu pour des fichiers individuels.-->

<!--|deDE:Entwicklung-->
<!--|frFR:Développement-->
Development
-----------

```bash
yarn install
yarn build
yarn test
```
