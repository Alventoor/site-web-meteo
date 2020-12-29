///////////////////////////////////////////////////////////////////////////////
// Ce script contrôle l'affichage des données en temps réel                  //
///////////////////////////////////////////////////////////////////////////////


/** Websocket chargée de récupérer les données toute les minutes. */
var websocket;
/** Pointeur vers la fonction chargée d'émettre la requête au serveur */
var sendRequest = sendAjaxRequest;


/**
 * Affiche les données climatiques récupérées au format JSON.
 * 
 * Le fichier JSON doit être au format suivant :
 *  {
 *      "temperature": 0,
 *      "pression": 0,
 *      "humidite": 0,
 *      "timestamp": 2020-01-01 12:00:00
 *  },
 * 
 * @param {*} data fichier JSON contenant les données envoyées par le serveur
 */
function displayData(data) {

    if (data.temperature == null)
        $("#temp").text("Aucune donnée");
    else 
        $("#temp").text(parseFloat(data.temperature).toFixed(1)+"°C");

    if (data.pression == null)
        $("#press").text("pression : Aucune donnée");
    else
        $("#press").text("pression : "+Math.round(data.pression)+" hPa");

    if (data.humidite == null)
        $("#hum").text("hygrométrie : Aucune donnée");
    else
        $("#hum").text("hygrométrie : "+parseFloat(data.humidite).toFixed(1)+"%");

    if (data.timestamp == null)
        $("#timestamp").text("Indisponible");
    else
        $("#timestamp").text(getDate(data.timestamp, true));
    
    $("#donnees").show();
}

/**
 * Demande au serveur les dernières données climatiques via le protocole
 * websocket.
 * 
 * @param {number} idImmeuble identifiant de l'immeuble dont l'on souhaite
 *  récupérer les données
 */
function sendWebSocketRequest(idImmeuble) {
    websocket.send(idImmeuble);
}

/**
 * Demande au serveur les dernières données climatiques via une requête ajax.
 * 
 * @param {number} idImmeuble identifiant de l'immeuble dont l'on souhaite
 *  récupérer les données
 */
function sendAjaxRequest(idImmeuble) {
    ajaxRequest("obtenirDernieresDonnees", displayData, {"idImmeuble": idImmeuble});
}

/**
 * Établit la connexion entre le navigateur et le serveur via une websocket.
 * 
 * L'adresse ip du serveur est transmise sous la forme du fichier JSON suivant :
 *  {
 *      "adresseIp": 127.0.0.1
 *  }
 * 
 * @param {*} data fichier JSON contenant l'adresse ip du serveur
 */
function openWebSocket(data) {
    websocket = new WebSocket("ws://"+data.adresseIp+":8888");

    websocket.onopen = function() {
        console.log("Ouverture webSocket");

        // On utilise désormais la websocket pour émettre les requêtes
        sendRequest = sendWebSocketRequest;
    }

    websocket.onclose = function(event) {
        console.log("code fermeture webSocket : "+event.code);
        console.log("raison fermeture webSocket : "+event.reason);

        // On utilise désormais ajax pour émettre les requêtes
        sendRequest = sendAjaxRequest;
    }

    websocket.onerror = function() {
        console.log("Erreur webSocket");
    }

    websocket.onmessage = function(event) {
        console.log("Réception de données depuis la webSocket");

        const jsonData = JSON.parse(event.data);
        displayData(jsonData);
    }
}


$(document).ready(function() {
    const interval = 60000;
    var timerID;

    // Mise en place de la websocket si supportée

    if (window.WebSocket)
        ajaxRequest("getAddress", openWebSocket);

    // Contrôle l'affichage des données en temps réel

    $("#immeuble").change(function() {
        if (this.value) {
            // Arrêt de l'émission de requête
            window.clearInterval(timerID);

            sendRequest(this.value);
            timerID = window.setInterval(sendRequest, interval, this.value);
        }
    });
});
