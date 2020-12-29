///////////////////////////////////////////////////////////////////////////////
// Ce script contrôle l'affichage des données au sein d'un météogramme.      //
//                                                                           //
// Script requis pour son fonctionnement : meteogramme.js                    //
///////////////////////////////////////////////////////////////////////////////

/**
 * Classe Form
 * 
 * Rassemble les données nécessaires à l'émission d'une requête au serveur.
 */
function Form() {
    /** Date à partir de laquelle l'utilisateur souhaite visualiser les données */
    this.date = "";

    /**
     * Période sur laquelle l'utilisateur souhaite visualiser les données
     * 
     *  "annees"    : récupère les données de l'année (par mois)
     * 
     *  "mois"      : récupère les données du mois (par jour)
     * 
     *  "semaine"   : récupère les données de la semaine (par jour)
     * 
     *  "jour"      : récupère les données du jour (par heure)
     */
    this.period = "";

    /** 
     * Type de données que souhaite visualiser l'utilisateur
     * 
     *  "max" : les valeurs maximales
     * 
     *  "moy" : les valeurs moyennes
     * 
     *  "min" : les valeurs minimales
     */
    this.type = "";

    /**
     * Identifiant de l'immeuble où se situe le capteur ayant effectué les
     * relevés
     */
    this.idBuilding = "";
}

/**
 * Renvoie vrai si les données du formulaire sont valides.
 * 
 * Seul la date et l'identifiant de l'immeuble sont vérifiés.
 */
Form.prototype.isValid = function() {
    return this.date && this.idBuilding;
}

/**
 * Envoie une requête ajax contenant les données du formulaires.
 * 
 * Attention, aucune vérification de la validité n'est effectuée avant l'envoie.
 * 
 * @param {Function} successFunction fonction à exécuter en cas de succès de la
 *  requête
 */
Form.prototype.send = function(successFunction) {
    const data = {
        "date": this.date, "periode": this.period,
        "type": this.type, "idImmeuble": this.idBuilding
    };

    ajaxRequest("obtenirDonnees", successFunction, data);
}

/**
 * Met à jour les données du météogramme passé en paramètre.
 * 
 * Les données affichées dépendent de la valeur de l'attribut "type" de l'objet
 * Form. Si le cache du météogramme ne contient pas encore de données, celles-ci
 * sont téléchargées depuis le serveur en fonction de l'objet Form.
 */
Form.prototype.updateMeteogram = function(meteogram) {
    switch(this.type) {
        case "max":
            var climateData = meteogram.maximum;
            break;
        case "moy":
            var climateData = meteogram.average;
            break;
        case "min":
            var climateData = meteogram.minimum;
            break;
        default:
            console.log("Erreur : le type de données demandé est incorrecte ("+this.type+")");
            return;
    }
    
    if (!climateData.isEmpty())
        meteogram.draw(climateData);
    else
        this.send(function(jsonData) {
            climateData.loadFromJson(jsonData);
            meteogram.draw(climateData);
        });

    $("#donnees").show();
}

/**
 * Réinitialise les données du météogramme passé en paramètre.
 * 
 * Ses données sont effacées et de nouvelles sont téléchargées depuis le serveur
 * en fonction de l'objet Form.
 * 
 * @param {Meteogram} meteogram météogramme réinitialisé
 */
Form.prototype.resetMeteogram = function(meteogram) {
    meteogram.reset(this.date, this.period);
    this.updateMeteogram(meteogram);
}

/**
 * Génère la liste des semaines du mois sélectionné par l'utilisateur.
 * 
 * Si l'année ou le mois sélectionné possède une valeur invalide, alors la liste
 * est remplie avec un élément affichant l'action à réaliser pour obtenir les
 * semaines.
 * 
 */
function generateWeeks() {
    const year = $("#annee").val();
    const month = $("#mois").val() - 1;

    $("#semaine").empty();

    if (!year)
        $("#semaine").append($("<option>", {value: ""}).text("Veuillez sélectionner une année"));
    else if (month == -1)
        $("#semaine").append($("<option>", {value: ""}).text("Veuillez sélectionner un mois"));
    else {
        $("#semaine").append($("<option>", {value: ""}).text("Sélectionnez une semaine"));

        let date = new Date(Date.UTC(year, month, 1));
        const nextMonth = (month == 11) ? 0 : month + 1;

        // Décalage des valeurs, ainsi "monday" = 0
        const dayOfTheWeek = (date.getDay() || 7) - 1;

        // On se réajuste sur le lundi de la première semaine
        if (dayOfTheWeek > 0)
            date.setDate(date.getDate() - dayOfTheWeek);

        // Boucle sur les lundis de toutes les semaines du mois
        while (date.getMonth() != nextMonth) {
            let value = date.toJSON().slice(0, 10);
            $("#semaine").append($("<option>", {value: value}).text("Semaine du "+date.getDate()+" "+getMonth(date)));

            // On passe à la semaine suivante
            date.setDate(date.getDate() + 7);
        }
    }
}

/**
 * Règle l'affichage des balises du formulaire des périodes. 
 * 
 * @param {boolean} year affiche ou non la liste des années
 * @param {boolean} month affiche ou non la liste des mois
 * @param {boolean} week affiche ou non la liste des semaines
 * @param {boolean} day affiche ou non le choix de la date
 */
function showPeriodInput(year, month, week, day) {
    $("#annee").toggle(year);
    $("#labelAnnee").toggle(year);
    $("#mois").toggle(month);
    $("#labelMois").toggle(month);
    $("#semaine").toggle(week);
    $("#labelSemaine").toggle(week);
    $("#jour").toggle(day);
    $("#labelJour").toggle(day);
}

/**
 * Affiche les années récupérées au format JSON.
 * 
 * @param {*} data fichier contenant les données envoyées par le serveur
 */
function displayAnnee(data) {
    fillList("#annee", "Sélectionnez une année", data, "Aucune donnée disponible");
}

/**
 * Désactive/active le formulaire permettant de choisir la date des données
 * à consulter.
 * 
 * @param {boolean} disable si vrai, désactive le formulaire
 */
function disableDateInputs(disable) {
    $("#choixDate :input").prop("disabled", disable);
}

/**
 * Réinitialise l'état du sélecteur d'immeuble si le formulaire contient
 * toujours un identifiant valide.
 * 
 * @param {Form} form formulaire dont l'on vérifie l'état
 */
function clearImmeuble(form) {
    if (form.idBuilding) {
        $("#immeuble").val("");
        $("#immeuble").change();
    }
}

$(document).ready(function() {
    var form = new Form();
    var meteogram = new Meteogram();

    // Contrôle le formulaire de l'adresse

    $("#region").change(function() { clearImmeuble(form) });
    $("#departement").change(function() { clearImmeuble(form) });
    $("#ville").change(function() { clearImmeuble(form) });

    $("#immeuble").change(function() {
        const yearList = $("#annee");

        form.idBuilding = this.value;
        disableDateInputs(!this.value);

        if (!this.value) {
            yearList.empty();
            yearList.append($("<option>", {value: ""}).text("Veuillez sélectionner un immeuble"));
        } else {
            // Récupération des années depuis la bdd
            ajaxRequest("listerAnnees", displayAnnee, { "idImmeuble": this.value });

            // Affiche immédiatement de nouvelles données si la période choisie
            // est sur une journée et la date valide.
            if (form.period == "jour" && form.date)
                form.resetMeteogram(meteogram);
        }

        // Signale que la liste des années a été actualisée
        yearList.change();

    });

    // Contrôle le formulaire de période

    $("input[name=periode]").change(function() {
        $("#donnees").hide();

        switch (this.value) {
            case "annee":
                showPeriodInput(true, false, false, false);
                $("#annee").val("");
                $("#mois").val("");
                $("#semaine").val("");
                break;
            case "mois":
                showPeriodInput(true, true, false, false);
                $("#mois").val("");
                $("#semaine").val("");
                break;
            case "semaine":
                showPeriodInput(true, true, true, false);
                $("#semaine").val("");
                break;
            case "jour":
                showPeriodInput(false, false, false, true);
                $("#jour").val("");
                break;
        }

        form.period = this.value;
    });

    // Contrôle le formulaire de la date

    $("#annee").change(function() {
        if (form.period == "annee") {
            form.date = this.value;

            if (form.isValid())
                form.resetMeteogram(meteogram);
        }

        if (this.value) {
            $("#mois option:not(:first-child)").show();
            $("#mois option:first-child").text("Sélectionnez un mois");
        } else {
            $("#mois option:not(:first-child)").hide();
            $("#mois option:first-child").text("Veuillez sélectionner une année");
        }
        
        // Actualise la liste des mois
        $("#mois").val("");
        $("#mois").change();
    });

    $("#mois").change(function() {
        // Si l'on visualise sur un mois
        if (form.period == "mois" && this.value && form.idBuilding) {
            form.date = $("#annee").val()+"-"+this.value;

            form.resetMeteogram(meteogram);
        }

        generateWeeks(); // Regénère la liste des semaines
    });

    $("#semaine").change(function() {
        form.date = this.value;

        if (form.isValid())
            form.resetMeteogram(meteogram);
    });

    $("#jour").change(function() {
        form.date = this.value;

        if (form.isValid())
            form.resetMeteogram(meteogram);
    });

    // Contrôle le choix des données visualisées (minimales, moyennes, maximales)

    $("input[name=donnees]").change(function() {
        form.type = this.value;
        form.updateMeteogram(meteogram);
    });

    // Actions executée au chargement de la page

    form.type = $("input[name=donnees]:checked").val();

    disableDateInputs(true);
    $("#annee").change(); // Reset le formulaire de la date
    $("input[name=periode]:checked").change(); // Configure l'affichage du formulaire de la date
});
