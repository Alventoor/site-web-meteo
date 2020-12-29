// Traduction de Highcharts en français
Highcharts.setOptions({
    lang: {
        loading: 'Chargement...',
        months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        shortMonths: ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'],
        rangeSelectorFrom: "Du",
        rangeSelectorTo: "au",
        rangeSelectorZoom: "Période",
        resetZoom: "Réinitialiser le zoom",
        resetZoomTitle: "Réinitialiser le zoom",
        thousandsSep: " ",
        decimalPoint: ','
    }
});

/**
 * Classe ClimateData
 * 
 * Cette classe permet de stocker les données météos et de les afficher sur un
 * graphique Highcharts.
 */
function ClimateData() {
    // Simule des attributs privés.
    var temperatures = [];
    var pressures = [];
    var humidities = [];

    /**
     * Charge de nouvelles données météo depuis un fichier JSON.
     * 
     * Le fichier (ou l'objet) doit être au format suivant :
     *  {
     *      "temperatures": [0.0, 0.0, 0.0, 0.0],
     *      "pressions": [0.0, 0.0, 0.0, 0.0],
     *      "humidites": [0.0, 0.0, 0.0, 0.0]
     *  }
     * 
     * Les anciennes données sont écrasées.
     * 
     * @param {*} data fichier JSON contenant les données
     */
    this.loadFromJson = function(data) {
        temperatures = data.temperatures;
        pressures = data.pressions;
        humidities = data.humidites;
    };

    /**
     * Affiche les données au sein de série faisant partie d'un graphique
     * Highcharts.
     * 
     * Les précédentes données des séries sont écrasé.
     * 
     * @param {*} tempSeries série des températures
     * @param {*} pressSeries série des pressions
     * @param {*} humSeries série des pourcentages d'humidité
     */
    this.displayOnChart = function(tempSeries, pressSeries, humSeries) {
        tempSeries.setData(temperatures, false, true, false);
        pressSeries.setData(pressures, false, true, false);
        humSeries.setData(humidities, false, true, false);
    };

    /**
     * Efface les données enregistrées.
     */
    this.clear = function() {
        temperatures.length = 0;
        pressures.length = 0;
        humidities.length = 0;
    };

    /**
     * Renvoie vrai si aucune données n'est présente.
     */
    this.isEmpty = function() {
        return temperatures.length == 0
            && pressures.length == 0
            && humidities.length == 0;
    };
}


/**
 * Classe Meteogram
 * 
 * Cette classe représente un météogramme capable d'afficher les températures,
 * pressions et pourcentages d'humitidé relevés sur différentes périodes.
 * 
 * Les périodes valident sont :
 *  jour     : Affiche les données pour chaque heure sur 24 heures
 *  semaine  : Affiche les données pour chaque jour sur 7 jours
 *  mois     : Affiche les données pour chaque jour sur 1 mois
 *  année    : Affiche les données pour chaque mois sur 12 mois
 * 
 * Trois ensembles de données relevées peuvent être enregistrés dans le
 * météogramme. Les maximales, les moyennes et les minimales. Il faut donc
 * choisir l'ensemble que l'on souhaite afficher en appelant les fonctions draw,
 * drawMaximum drawAverage et drawMinimum.
 *
 * Lors de l'initialisation de cette classe, renderTo spécifie sur quel élément
 * html le météogramme sera dessiné. Par défaut, si aucune valeur n'est passée
 * ou qu'il ne s'agit pas d'une chaîne de caractère, le météogramme est dessiné
 * sur l'élément ayant l'id "meteogramme".
 */
function Meteogram(renderTo) {
    if (typeof renderTo != "string")
        renderTo = "meteogramme";

    // Initialisation du météogramme
    var chart = Highcharts.chart(renderTo, {
        tooltip: { shared: true },

        plotOptions: {
            series: {
                connectNulls: true,
                marker: { radius: 3 }
            }
        },

        xAxis: {
            type: "datetime",
            gridLineWidth: 0.5,
            tickmarkPlacement: "between",
            minPadding: 0,
            maxPadding: 0,
        },

        yAxis: [
            { // Axe des températures
                title: { text: "Température (°C)" },
                labels: { format: "{value}°" },
                plotLines: [{
                    value: 0,
                    width: 1,
                }],
                minTickInterval: 0.25
            }, { // Axe de la pression
                allowDecimals: false,
                opposite: true,
                title: {
                    text: "Pression (hPa)"
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                }],
            }, { // Axe du taux d'humidité
                allowDecimals: false,
                title: { text: null },
                labels: { enabled: false },
                min: 0,
                max: 250, // Permet de limiter la hauteur des colonnes
            }
        ],

        series: [
            {
                name: "températures",
                tooltip: { valueSuffix: "°C", valueDecimals: 1 },
                color: "#EF4F37",
                yAxis: 0,
                zIndex: 2,
            }, {
                name: "pression",
                tooltip: { valueSuffix: " hPa", valueDecimals: 0 },
                color: "#7E4EFF",
                yAxis: 1,
                zIndex: 1,
            }, {
                name: "hygrométrie",
                type: "column",
                groupPadding: 0,
                pointPadding: 0,
                tooltip: { valueSuffix: " %", valueDecimals: 1 },
                color: "#56B1F7",
                yAxis: 2,
                zIndex: 0,
            }
        ],

        // Paramètres appliqués sur les petits écrans
        responsive: {
            rules: [{
                condition: { maxWidth: 500 },
                chartOptions: {
                    yAxis: [
                        { // Axe des températures
                            labels: {
                                align: "left",
                                x: 0,
                                y: -2,
                            },
                            title: { text: "" }
                        }, { // Axe de la pression
                            labels: {
                                align: "right",
                                x: 0,
                                y: -2,
                            },
                            title: { text: "" }
                        }, { /** Axe de l'humidité - rien à faire */ }
                    ]
                }
            }]
        }
    });

    // Initialisation des ensembles de données
    this.maximum = new ClimateData();
    this.average = new ClimateData();
    this.minimum = new ClimateData();

    /**
     * Dessine le contenu d'un objet ClimateData sur le météogramme.
     * 
     * @param {ClimateData} climateData contient les données à afficher
     */
    this.draw = function(climateData) {
        climateData.displayOnChart(chart.series[0], chart.series[1], chart.series[2]);

        chart.redraw();
    };

    /**
     * Actualise la période sur laquelle seront affichées les données.
     * 
     * @param {string} startDate date de départ du météogramme
     * @param {periode} periode période des données du météogramme.
     *  Valeurs possibles : "jour", "semaine", "mois", "annee"
     */
    this.setPeriod = function(startDate, periode) {
        const year = +startDate.slice(0, 4);
        const month = +startDate.slice(5, 7) - 1;
        const day = +startDate.slice(8, 10);

        // Calcul des nouvelles informations
        let interval = 1;

        switch (periode) {
            case "annee":
                var title = "Météogramme de l'année "+year;
                var xAxisTitle = "Mois de l'année";
                var pointIntervalUnit = "month";
                var timestamp = Date.UTC(year, 0);
                break;
            case "mois":
                var title = "Météogramme du mois de "+getMonth(month)+" "+year;
                var xAxisTitle = "Jours du mois";
                var pointIntervalUnit = "day";
                var timestamp = Date.UTC(year, month);
                break;
            case "semaine":
                var title = "Météogramme de la semaine du "+day+" "+getMonth(month)+" "+year;
                var xAxisTitle = "Jours de la semaine";
                var pointIntervalUnit = "day";
                var timestamp = Date.UTC(year, month, day);
                break;
            case "jour":
                var title = "Météogramme du "+getDate(startDate);
                var xAxisTitle = "Heures de la journée";
                var pointIntervalUnit = undefined;
                var timestamp = Date.UTC(year, month, day);
                interval = 60 * 60000;
                break;
            default:
                console.log("Erreur : la période passée au météogramme est invalide ("+periode+")");
                return;
        }

        // Actualisation des informations du diagramme
        chart.setTitle({ text: title }, false);
        chart.xAxis[0].setTitle({ text: xAxisTitle }, false);
        chart.series.forEach(function(_, index, series) {
            series[index].update({
                pointStart: timestamp,
                pointInterval: interval,
                pointIntervalUnit: pointIntervalUnit,
            });
        });
    };
}

/**
 * Efface toutes les données du météogramme.
 */
Meteogram.prototype.clear = function() {
    this.maximum.clear();
    this.average.clear();
    this.minimum.clear();
};

/**
 * Efface le contenu du météogramme et actualise la période sur laquelle seront
 * affichées les données.
 * 
 * @param {string} startDate date de départ du météogramme
 * @param {periode} periode période des données du météogramme -
 *  valeurs possibles : jour, semaine, mois, année
 */
Meteogram.prototype.reset = function(startDate, periode) {
    this.clear();
    this.setPeriod(startDate, periode);
};

/** Affiche les maximales sur le météogramme. */
Meteogram.prototype.drawMaximum = function() { draw(this.maximum); };
/** Affiche les moyennes sur le météogramme. */
Meteogram.prototype.drawAverage = function() { draw(this.average); };
    /** Affiche les minimales sur le météogramme. */
Meteogram.prototype.drawMinimum = function() { draw(this.minimum); };
