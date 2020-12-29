///////////////////////////////////////////////////////////////////////////////
//                                Ce script :                                //
//           Fournit diverses fonctions utiles aux autres scripts            //
//               Contrôle le formulaire d'adresse des capteurs               //
///////////////////////////////////////////////////////////////////////////////


/**
 * Renvoie le nom du mois de la date passée en paramètre.
 * 
 * Attention, si la date passée est le numéro du mois, ceux-ci vont de 0
 * (janvier) à 11 (décembre). Dans le cas où le numéro ne fait pas partie de cet
 * intervalle, "mois invalide" est renvoyé.
 * 
 * @param {number | Date} date date dont l'on souhaite obtenir le mois
 */
function getMonth(date) {
    if (typeof date == "object")
        var month = date.getMonth();
    else if (typeof date == "number" && date >= 0 && date <= 11)
        var month = date;
    else
        var month = 12;
    
    const months = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
        "mois invalide"
    ];

    return months[month];
}

/**
 * Renvoie une chaîne de caractère traduite correspondant à la date passée en
 * paramètre.
 * 
 * @param {string | Date} dateTime date que l'on souhaite convertir
 * @param {boolean} [displayTime] affiche ou non l'heure et les minutes
 */
function getDate(dateTime, displayTime) {
    // On récupère la date au format souhaité
    const date = (typeof dateTime == "string")
        ? new Date(dateTime.trim().replace(" ", "T")) // Permet de fonctionner sous IE
        : dateTime;

    var formattedDate = date.getDate()+" "+getMonth(date)+" "+date.getFullYear();

    if (displayTime) {
        var hours = date.getHours();
        var minutes = date.getMinutes();

        if (hours < 10)
            hours = "0"+hours;
        
        if (minutes < 10)
            minutes = "0"+minutes;

        formattedDate += " - "+hours+":"+minutes;
    }

    return formattedDate;
}

/**
 * Effectue une requête ajax vers le contrôleur php.
 * 
 * @param {string} commandName nom de la commande passée au contrôleur
 * @param {Function} successFunction fonction à executer en cas de succès de la
 *  requête
 * @param {*} data tableau associatif contenant les paramètres additionnels à
 *  passer au serveur
 */
function ajaxRequest(commandName, successFunction, data) {
    // Ajoute commandName à data. Si data n'est pas un objet, on l'ignore.
    if (typeof data == "object")
        data["commande"] = commandName;
    else {
        if (data != undefined)
            console.log("Attention : les données passées à ajaxRequest ne sont pas au bon format et sont donc ignorées.");

        data = {"commande": commandName};
    }

    $.ajax({
        url: "../php/controleur.php",
        data: data,
        dataType: "json",
        type: "POST",
        success: successFunction,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("param : "+JSON.stringify(jqXHR));
            console.log("status : "+textStatus);
            console.log("error : "+errorThrown);
        }
    });
}

/**
 * Ajoute au sein d'une balise <select> le contenu du tableau data.
 * 
 * Ce tableau doit être au format suivant :
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
 * @param {*} element balise select à remplir (Ex : $("#ville"))
 * @param {*} data tableau contenant les informations à ajouter
 */
function fillListPreserve(element, data) {
    data.forEach(function(item, _) {
        element.append($("<option>", {value: item.id}).text(item.desc));
    });
}

/**
 * Efface le contenu d'une balise <select> avant de la remplir avec le contenu
 * du tableau data. Cette fonction ajoute aussi une première balise <option>
 * dont la valeur est vide et la description defaultDesc.
 * 
 * Si data est vide et que emptyDesc est spécifié, la première balise l'utilisera
 * comme description.
 * 
 * Pour le contenu de data, voir la fonction fillListPreserve().
 * 
 * @param {string} selectId identifiant de la balise select à remplir (Ex : "#ville")
 * @param {string} defaultDesc description de la balise <option> par défaut
 * @param {Array} data fichier JSON contenant les informations de la liste
 * @param {string} [emptyDesc] description de la balise <option> par défaut si la
 *  liste est vide
 */
function fillList(selectId, defaultDesc, data, emptyDesc) {
    if (Array.isArray(data)) {
        if (emptyDesc == undefined)
            emptyDesc = defaultDesc;

        desc = (data.length > 0) ? defaultDesc : emptyDesc;

        var element = $(selectId);

        element.empty();
        element.append($("<option>", {value: ""}).text(desc));
        fillListPreserve(element, data);
    } else
        console.log("Erreur : le fichier reçue pour remplir la liste "+selectId+" n'est pas un tableau");
}

/**
 * Affiche les régions récupérées au format JSON.
 * 
 * @param {*} data fichier contenant les données envoyées par le serveur
 */
function displayRegion(data) {
    fillListPreserve($("#region"), data);
}

/**
 * Affiche les département récupérés au format JSON.
 * 
 * @param {*} data fichier contenant les données envoyées par le serveur
 */
function displayDepartement(data) {
    fillList("#departement", "Sélectionnez un département", data, "Aucun département disponible");
}

/**
 * Affiche les villes récupérées au format JSON.
 * 
 * @param {*} data fichier contenant les données envoyées par le serveur
 */
function displayVille(data) {
    fillList("#ville", "Sélectionnez une ville", data, "Aucune ville disponible");
}

/**
 * Affiche les immeubles récupérés au format JSON.
 * 
 * @param {*} data fichier contenant les données envoyées par le serveur
 */
function displayImmeuble(data) {
    fillList("#immeuble", "Sélectionnez un immeuble", data, "Aucun immeuble disponible");
}

// Contrôle le formulaire d'adresse
$(document).ready(function() {

    // Initialise la liste déroulante des régions
    ajaxRequest("listerRegions", displayRegion);

    $("#region").change(function() {
        $("#ville").empty();
        $("#immeuble").empty();

        if (!this.value)
            $("#departement").empty();
        else
            ajaxRequest("listerDepartements", displayDepartement, {"idRegion": this.value});
    });

    $("#departement").change(function() {
        $("#immeuble").empty();

        if (!this.value)
            $("#ville").empty();
        else
            ajaxRequest("listerVilles", displayVille, {"idDepartement": this.value});
    });

    $("#ville").change(function() {
        if (!this.value)
            $("#immeuble").empty();
        else
            ajaxRequest("listerImmeubles", displayImmeuble, {"idVille": this.value});
    });
});
