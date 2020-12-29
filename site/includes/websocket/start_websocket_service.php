<?php

///////////////////////////////////////////////////////////////////////////////
//                  Ce script démarre le service websocket                   //
///////////////////////////////////////////////////////////////////////////////

require_once "PHP-Websockets/websockets.php";
require_once "../weather_function.php";

const HOST = "0.0.0.0";
const PORT = 8888;


class WebSocket extends WebSocketServer {
    /**
     * Fonction exécutée lors de la réception d'une requête.
     * 
     * Le message attendu est l'identifiant de l'immeuble pour lequel le client
     * souhaite obtenir les dernières données relevées.
     * 
     * Si le message est bien valide, les données sont renvoyées sous la forme
     * d'une chaîne de caractère JSON. Exemple :
     * "{
     *      "temperature": 0.0,
     *      "pression": 0.0,
     *      "humidite": 0.0,
     *      "timestamp": "2020-01-01 12:00:00"
     * }"
     * 
     * Si le message est invalide, le serveur l'ignore.
     * 
     * @param $user client effectuant la requête
     * @param $message message envoyé par le client au serveur - l'identifiant
     *  d'un immeuble au sein de la bdd
     */
    protected function process($user, $message) {
        $idImmeuble = intval($message);

        if ($idImmeuble)
            $this->send($user, getLatestData($idImmeuble));
    }

    /**
     * Fonction exécutée lors de la connexion d'un nouveau client.
     * 
     * @param $user client établissant la connexion
     */
    protected function connected($user) { /* Rien à faire */ }

    /**
     * Fonction eéecutée lors de la fermeture d'une connexion.
     * 
     * @param $user client dont la connexion est fermée.
     */
    protected function closed($user) { /* Rien à faire */ }
}


$server = new WebSocket(HOST, PORT);

try {
    $server->run();
} catch (Exception $e) {
    $server->stdout($e->getMessage());
}

?>
