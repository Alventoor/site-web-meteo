<?php

///////////////////////////////////////////////////////////////////////////////
// Ce script contient les éléments permettant de récupérer les données       //
// climatiques de la bdd                                                     //
///////////////////////////////////////////////////////////////////////////////


require_once "utils.php";


const REQUEST_PATTERN = "SELECT __positionSelect AS pos,
                            __dataSelect
                            FROM donnees_capteurs
                            WHERE __whereClause
                            AND id_immeuble = :id
                            GROUP BY pos
                            ORDER BY pos ASC;";
const MAXIMUM = "MAX(temperature) AS temp,
                    MAX(pression) AS press,
                    MAX(humidite) AS hum";
const AVERAGE = "AVG(temperature) AS temp,
                    AVG(pression) AS press,
                    AVG(humidite) AS hum";
const MINIMUM = "MIN(temperature) AS temp,
                    MIN(pression) AS press,
                    MIN(humidite) AS hum";


/**
 * Génère une requête SQL en fonction de la période ainsi que du type passés en
 * paramètre.
 * 
 * Les commandes valides sont :
 *  "annees"    : récupère les données de l'année (par mois)
 *  "mois"      : récupère les données du mois (par jour)
 *  "semaine"   : récupère les données de la semaine (par jour)
 *  "jour"      : récupère les données du jour (par heure)
 * 
 * les types valides sont :
 *  "max"   : récupère les valeurs maximales
 *  "moy"   : récupère les valeurs moyennes
 *  "min"   : récupère les valeurs minimales
 * 
 * 
 * @param string $period période sur laquelle récupérer les données 
 * @param string $type type de données à récupérer
 */
function generateRequest(string &$period, string &$type): string {
    $needles = array("__positionSelect", "__dataSelect", "__whereClause");
    $requestFragments = array(NULL, NULL, "date_mesure LIKE :date");

    switch($period) {
        case "annee":
            $requestFragments[0] = "MONTH(date_mesure) - 1";
            break;
        case "mois":
            $requestFragments[0] = "DAY(date_mesure) - 1";
            break;
        case "semaine":
            // Attention, la fonction WEEKDAY est spécifique à MySQL !
            $requestFragments[0] = "WEEKDAY(date_mesure)";
            $requestFragments[2] = "date_mesure BETWEEN :date AND :endDate";
            break;
        case "jour":
            // Attention, la fonction HOUR est spécifique à MySQL !
            $requestFragments[0] = "HOUR(date_mesure)";
            break;
        default:
            die("Erreur : période invalide pour la génération de la requête : ".$period);
    }

    switch ($type) {
        case "max":
            $requestFragments[1] = MAXIMUM;
            break;
        case "moy":
            $requestFragments[1] = AVERAGE;
            break;
        case "min":
            $requestFragments[1] = MINIMUM;
            break;
        default:
            die("Erreur : le type des données spécifié est invalide : ".$type);
    }

    return str_replace($needles, $requestFragments, REQUEST_PATTERN);
}

/**
 * Récupère les données météos depuis la bdd via la requête $request. Pour être
 * valides, les tuples retournés doivent être constitués des champs suivants :
 * 
 * temp     : flottant représentant la température relevée
 * press    : flottant représentant la pression relevée
 * hum      : flottant représentant l'humidité relevée
 * pos      : entier représentant la position des données dans le tableau final
 *            (doit commencer à zéro)
 * 
 * Le fichier renvoyé possède alors le format suivant :
 * {
 *      "temperature": [0.0, 0.0, 0.0, .., $maxNbLines - 1],
 *      "pression": [0.0, 0.0, 0.0, .., $maxNbLines - 1],
 *      "humidite": [0.0, 0.0, 0.0, .., $maxNbLines - 1],
 * }
 * 
 * Les tableaux ont une taille fixe correspondant à $maxNbLines. En outre, les
 * positions pour lesquelles aucun tuple ne correspond sont remplies avec la
 * valeur NULL.
 *
 * @param string $request requête SQL
 * @param array $parameters liste des paramètres dynamiques de la requête
 * @param int $maxNbLines taille maximale des tableaux
 * 
 * @return string fichier JSON contenant les données de la requête
 */
function getData(string &$request, array &$parameters, int $maxNbLines): string {
    $tempArray = array_fill(0, $maxNbLines, NULL);
    $pressArray = array_fill(0, $maxNbLines, NULL);
    $humArray = array_fill(0, $maxNbLines, NULL);

    $result = executeRequest($request, $parameters);

    while ($line = $result->fetch()) {
        $index = intval($line["pos"]);
    
        $tempArray[$index] = floatval($line["temp"]);
        $pressArray[$index] = floatval($line["press"]);
        $humArray[$index] = floatval($line["hum"]);
    }

    $result->closeCursor();

    $jsonData = (object) [
        "temperatures" => $tempArray,
        "pressions" => $pressArray,
        "humidites" => $humArray,
    ];
        
    return json_encode($jsonData);
}

/**
 * Émet les données météo relevées sur une période sous forme d'un fichier JSON.
 * 
 * Le fichier possède le format suivant :
 * {
 *      "temperature": [0.0, 0.0, 0.0, ...],
 *      "pression": [0.0, 0.0, 0.0, ...],
 *      "humidite": [0.0, 0.0, 0.0, ...],
 * }
 * 
 *  Les commandes valides pour récupérer les données sont :
 *  "annees"    : récupère les données de l'année (par mois)
 *  "mois"      : récupère les données du mois (par jour)
 *  "semaine"   : récupère les données de la semaine (par jour)
 *  "jour"      : récupère les données du jour (par heure)
 * 
 * les types valides pour récupérer les données sont :
 *  "max" : récupère les valeurs maximales
 *  "moy" : récupère les valeurs moyennes
 *  "min" : récupère les valeurs minimales
 * 
 * @param string $period période sur laquelle récupérer les données
 * @param int $idImmeuble identifiant de l'immeuble ayant effectué les relevés
 * @param string $date date à partir de laquelle récupérer les données
 * @param string $type type de données à récupérer
 */
function echoData(string &$period, int $idImmeuble, string &$date, string &$type) {
    $request = generateRequest($period, $type);
    $parameters = array(":id" => $idImmeuble, ":date" => $date."%");

    switch ($period) {
        case "annee":
            $maxNbLines = 12;
            break;
        case "mois":
            $maxNbLines = date('t', strtotime($date."-01")); // Renvoi le nombre de jour dans le mois
            break;
        case "semaine":
            $maxNbLines = 7;

            $endDate = (new DateTime($date))
                ->add(new DateInterval("P6D"))
                ->setTime(23, 59, 59)
                ->format("Y-m-d H:i:s");
            $parameters[":endDate"] = $endDate;
            $parameters[":date"] = $date;
            break;
        case "jour":
            $maxNbLines = 24;
            break;
    }

    $jsonData = getData($request, $parameters, $maxNbLines);

    header('Content-Type: application/json');
    echo $jsonData;
}

/**
 * Renvoie les dernières données météo relevées pour l'immeuble souhaité.
 * 
 * Les données sont renvoyées sous forme d'un fichier JSON :
 * {
 *      "temperature": 0.0,
 *      "pression": 0.0,
 *      "humidite": 0.0,
 *      "timestamp": "2020-01-01 12:00:00"
 * }
 * 
 * @param int $idImmeuble identifiant de l'immeuble abritant le capteur météo
 * 
 * @return string fichier JSON contenant les dernières données relevées
 */
function getLatestData(int $idImmeuble): string {    
    $request =
    "SELECT temperature, pression, humidite, date_mesure
        FROM donnees_capteurs
        WHERE date_mesure = (
            SELECT MAX(date_mesure)
                FROM donnees_capteurs
                WHERE donnees_capteurs.id_immeuble = :id
        );";
    $parameters = array(":id" => $idImmeuble);
        
    $result = executeRequest($request, $parameters);

    $line = $result->fetch();

    if ($line == FALSE)
        $jsonData = (object) [
            "temperature" => NULL,
            "pression" => NULL,
            "humidite" => NULL,
            "timestamp" => NULL
        ];
    else
        $jsonData = (object) [
            "temperature" => $line["temperature"],
            "pression" => $line["pression"],
            "humidite" => $line["humidite"],
            "timestamp" => $line["date_mesure"]
        ];

    $result->closeCursor();
        
    return json_encode($jsonData, JSON_NUMERIC_CHECK, JSON_FORCE_OBJECT);
}

/**
 * Émet les dernières données météo relevées pour l'immeuble $idImmeuble.
 * 
 * Les données sont émises sous forme d'un fichier JSON :
 * {
 *      "temperature": 0.0,
 *      "pression": 0.0,
 *      "humidite": 0.0,
 *      "timestamp": "2020-01-01 12:00:00"
 * }
 * 
 * @param int $idImmeuble identifiant de l'immeuble abritant le capteur météo
 */
function echoLatestData(int $idImmeuble) {
    header('Content-Type: application/json');
    echo getLatestData($idImmeuble);
}

?>