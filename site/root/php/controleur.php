<?php

////////////////////////////////////////////////////////////////////////////////
// Ce script est chargé de traiter les requêtes ajax envoyées par les clients //
////////////////////////////////////////////////////////////////////////////////

    require_once "../../includes/form.php";
    require_once "../../includes/weather_function.php";

    // Supporte la réception de donnée via la méthode post
    if (filter_input(INPUT_SERVER, "REQUEST_METHOD") == "POST") {
        // Récupère la donnée en provenance du formulaire
        $command = filter_input(INPUT_POST, 'commande');
    }

    if (isset($command)) {
        switch($command) {
            case "listerRegions":
                echoList($command);
                break;
            case "listerDepartements":
                $idRegion = filter_input(INPUT_POST, "idRegion", FILTER_SANITIZE_NUMBER_INT);
                echoList($command, $idRegion);
                break;
            case "listerVilles":
                $idDepartement = filter_input(INPUT_POST, "idDepartement", FILTER_SANITIZE_NUMBER_INT);
                echoList($command, $idDepartement);
                break;
            case "listerImmeubles":
                $idVille = filter_input(INPUT_POST, "idVille", FILTER_SANITIZE_NUMBER_INT);
                echoList($command, $idVille);
                break;
            case "listerAnnees":
                $idImmeuble = filter_input(INPUT_POST, "idImmeuble", FILTER_SANITIZE_NUMBER_INT);
                echoList($command, $idImmeuble);
                break;
            case "obtenirDernieresDonnees":
                $idImmeuble = filter_input(INPUT_POST, "idImmeuble", FILTER_SANITIZE_NUMBER_INT);
                echoLatestData($idImmeuble);
                break;
            case "obtenirDonnees":
                $idImmeuble = filter_input(INPUT_POST, "idImmeuble", FILTER_SANITIZE_NUMBER_INT);
                $period = filter_input(INPUT_POST, "periode");
                $date = filter_input(INPUT_POST, "date");
                $type = filter_input(INPUT_POST, "type");
                echoData($period, $idImmeuble, $date, $type);
                break;
            case "getAddress":
                $jsonData = (object) ["adresseIp" => $_SERVER["SERVER_ADDR"]];
                header('Content-Type: application/json');
                echo json_encode($jsonData, JSON_FORCE_OBJECT);
                break;
        }
    }
?>
