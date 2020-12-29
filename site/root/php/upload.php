<?php

////////////////////////////////////////////////////////////////////////////////////
// Ce script permet aux stations météo d'enregistrer leurs données sur le serveur //
////////////////////////////////////////////////////////////////////////////////////

    require_once "../../includes/utils.php";
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $jsonFile = file_get_contents("php://input");
        
        insertNewData($jsonFile);
    }
//?>
