<?php
 
///////////////////////////////////////////////////////////////////////////////
//   Ce script contient les éléments utiles à la communication avec la bdd   //
///////////////////////////////////////////////////////////////////////////////


const SERVERDB = "127.0.0.1";
const NAMEDB = "station_meteo";
const CLIENTLOGIN = "client";
const CLIENTPASSWORD = "PrivateClient";
const STATIONLOGIN = "station";
const STATIONPASSWORD = "PrivateStation";

const UPLOADPASSWORD = "0000";


/**
 * Effectue la connexion à la base de donnée.
 * 
 * En cas de succès, renvoie la connexion établie. Sinon, quitte le script.
 * 
 * @param string $login nom d'utilisateur du compte
 * @param string $password mot de passe du compte
 * 
 * @return PDO connexion à la bdd
 */
function connectDB(string $login, string $password): PDO {
    try {
        $pdoParameters = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);

        $db = new PDO("mysql:host=".SERVERDB.";dbname=".NAMEDB, $login, $password, $pdoParameters);
        $db->exec("set names utf8");

        return $db;
    } catch (PDOException $e) {
        die("Erreur lors de la connexion à la base de donnée : ".$e->getMessage());
    }
}

/**
 * Exécute une requête au nom d'un client (SELECT autorisé seulement).
 * 
 * Si l'exécution est un succès la requête est renvoyée, sinon on quitte le
 * script.
 * 
 * Pour être accepté, le tableau de paramètre $parameters doit être de la forme
 * suivante : array(":param1" => $value1, ":param2" => $value2, etc...);
 * 
 * @param string $request contenu de la requête
 * @param array $parameters liste des paramètres dynamiques de la requête
 * 
 * @return PDOStatement la requête exécutée
 */
function executeRequest(string &$request, array &$parameters = array()): PDOStatement {
    $db = connectDB(CLIENTLOGIN, CLIENTPASSWORD);

    try {
        if (empty($parameters))
            $request = $db->query($request);
        else {
            $request = $db->prepare($request);

            $request->execute($parameters) or die(print_r($request->errorInfo()));
        }

        return $request;
    } catch (PDOException $e) {
        die("Erreur lors de la préparation de la requête : ".$e->getMessage());
    }
}

/**
 * Récupère les données météos depuis le fichier passé en paramètre afin de les
 * enregistrer dans la bdd.
 * 
 * Pour que l'enregistrement ait lieu, le fichier JSON doit avoir le format
 * suivant :
 * 
 * {
 *   "mdp": "Foo",
 *   "idImmeuble": 1,
 *   "donnees": [
 *       {
 *          "horodatage": "2020-01-01 12:00:00",
 *          "temperature": 15,
 *          "pression": 1000,
 *          "humidite": 60
 *      },
 *      {
 *          "horodatage": "2020-01-01 12:15:00",
 *          "temperature": 15.2,
 *          "pression": 998.7,
 *          "humidite": 57
 *      }
 *  ]
 * }
 * 
 * Il faut aussi que la chaîne de caractère "mdp" corresponde à UPLOADPASSWORD.
 * 
 * Cette fonction permet de masquer les informations concernant les stations
 * météos et la bdd aux clients.
 */
function insertNewData(string $jsonFile) {
    $decodedJson = json_decode($jsonFile);

    if ($decodedJson != NULL && $decodedJson->mdp == UPLOADPASSWORD) {
        try {
            $db = connectDB(STATIONLOGIN, STATIONPASSWORD);

            $request = $db->prepare(
                    "INSERT INTO donnees_capteurs(
                       id_immeuble, date_mesure, temperature, pression, humidite)
                    VALUES(:idBuild, :timestamp, :temp, :press, :hum);");   
            $request->bindParam(":idBuild", $decodedJson->idImmeuble);

            foreach ($decodedJson->donnees as $data) {
                $request->bindParam(":timestamp", $data->horodatage);
                $request->bindParam(":temp", $data->temperature);
                $request->bindParam(":press", $data->pression);
                $request->bindParam("hum", $data->humidite);
                $request->execute() or die(print_r($request->errorInfo()));
            }

            $request->closeCursor();
        } catch (PDOException $e) {
            die("Erreur lors de la préparation de la requête : ".$e->getMessage());
        }
    }
}
?>