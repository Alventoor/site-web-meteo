<?php

///////////////////////////////////////////////////////////////////////////////
// Ce script contient les fonctions permettant de remplir les formulaires du //
// site web                                                                  //
///////////////////////////////////////////////////////////////////////////////


require_once "utils.php";


/**
 * Exécute la requête SQL correspondant à $requestCode puis émet les données
 * acquises sous la forme d'un tableau JSON :
 * 
 * [
 *  {
 *     "id": 0,
 *     "desc": "Foo"
 *  },
 *  {
 *      "id": 1,
 *      "desc": "Bar"
 *  }
 * ]
 * 
 * Les types de id et de desc peuvent varier en fonction de la requête.
 * 
 * Les différents codes valides sont :
 * "listerRegions"      : récupère la liste des régions
 * "listerDepartements" : récupère la liste des départements de la région $id
 * "listerVilles"       : récupère la liste des villes du département $id
 * "listerImmeubles"    : récupère la liste des immeubles de la villde $id
 * "listerAnnees"       : récupère la liste des annees pour lesquelles des
 *                        relevés météos ont été effectués à l'immeuble $id
 * 
 * @param string $requestCode code représentant la requête SQL
 * @param int $id optionnel - identifiant de l'élément auquel appartient les
 * données que l'on souhaite récupérer
 */
function echoList(string &$requestCode, int $id = 0) {
    $parameters = array(":id" => $id);

    switch ($requestCode) {
        case "listerRegions":
            $request =
                "SELECT id_region, nom_region
                    FROM regions
                    ORDER BY nom_region ASC;";
            $idFieldName = "id_region";
            $descFieldName = "nom_region";
            break;
        case "listerDepartements":
            $request =
                "SELECT id_departement, nom_departement
                    FROM departements
                    WHERE id_region = :id
                    ORDER BY id_departement ASC;";
            $idFieldName = "id_departement";
            $descFieldName = "nom_departement";
            break;
        case "listerVilles":
            $request =
                "SELECT id_ville, nom_ville
                    FROM villes
                    WHERE id_departement = :id
                    ORDER BY nom_ville ASC;";
            $idFieldName = "id_ville";
            $descFieldName = "nom_ville";
            break;
        case "listerImmeubles":
            $request =
                "SELECT id_immeuble, adresse
                    FROM immeubles
                    WHERE id_ville = :id;";
            $idFieldName = "id_immeuble";
            $descFieldName = "adresse";
            break;
        case "listerAnnees":
            $request =
                "SELECT DISTINCT YEAR(date_mesure) AS annee
                    FROM donnees_capteurs
                    WHERE id_immeuble = :id
                    ORDER BY annee DESC;";
            $idFieldName = $descFieldName = "annee";
            break;
        default:
            die("Erreur : code de requête invalide : ".$requestCode);
    }

    $result = executeRequest($request, $parameters);

    $jsonData = array();
    while ($line = $request->fetch()) {
        array_push($jsonData, array(
            "id" => $line[$idFieldName],
            "desc" => $line[$descFieldName]
        ));
    }
    $result->closeCursor();

    header('Content-Type: application/json');
    echo json_encode($jsonData, JSON_NUMERIC_CHECK);
}

?>