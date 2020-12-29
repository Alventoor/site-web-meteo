## Présentation

Ce site internet fait partie d'un mini-projet effectué lors de ma seconde année en BTS
Systèmes Numériques, option Informatique et Réseaux. Il permet le stockage ainsi que
l'affichage de données météo. Ces données sont ensuite consultables, soit en temps réel,
soit sous forme de graphique sur des périodes définies.

Ce Readme décrit brièvement la mise en place du site. Pour plus d'informations, voir la
documentation fournie.

## Librairies utilisées

Toutes les librairies sont fournies ou téléchargées automatiquement.

| Nom            | Version  |
| -------------- | -------  |
| JQuery         | 3.4.1    | 
| Highcharts     | Dernière |
| Bootstrap      | 4.4.1    |
| PHP-Websockets | Dernière |

La librairie PHP pour les Websockets peut être trouvée à l'adresse suivante : https://github.com/ghedipunk/PHP-Websockets

## Installation

Pour fonctionner, ce site internet doit être installé sur un serveur Apache 2 possédant
une version de PHP supérieure ou égale à la 7.1 ainsi qu'une base de données tournant sous
MySQL ou sous tout SGBDR compatible MySQL.

Le dossier **site** contient les deux dossiers à installer, **root** et **includes**. Le
contenu du dossier **root** doit être placé au sein du dossier racine du site internet.
Tandis que le dossier **includes** doit être installé à côté du dossier racine.

## Configuration du site internet

Le script **utils.php** présent dans le dossier includes contient les paramètres suivants :

| Nom             | Description                                         | Valeur par défaut |
| --------------- | --------------------------------------------------- | ----------------- |
| SERVERDB        | Adresse IPv4 de la BDD                              | "127.0.0.1"       |
| NAMEDB          | Nom de la BDD                                       | "station_meteo"   |
| CLIENTLOGIN     | Login de l'utilisateur chargé de lire les données   | "client"          |
| CLIENTPASSWORD  | Mdp de l'utilisateur chargé de lire les donnée      | "PrivateClient"   |
| STATIONLOGIN    | Login des stations chargé d'enregistrer les données | "station"         |
| STATIONPASSWORD | Mdp des stations chargé d'enregistrer les données   | "PrivateStation"  |
| UPLOADPASSWORD  | Mdp sécurisant l'enregistrement des données reçues  | "0000"            |

## Configuration de la BDD

le dossier **bdd** contient des scripts SQL permettant de rapidement créer et configurer la
base de données utilisée par le site ainsi que ses utilisateurs. Avant d'exécuter le script
**utilisateurs.sql**, il est recommandé de changer les mots de passe par défaut.

## Activation du service de WebSocket

Par défaut, l'actualisation des données météo en temps réel s'effectue à l'aide de requêtes
AJAX. Cependant, le site favorise l'utilisation du protocole WebSocket lorsque cela est
possible. Pour activer le service WebSocket, il suffit d'exécuter le script **start_websocket_service.php**
présent dans le dossier **site/includes/websocket**.