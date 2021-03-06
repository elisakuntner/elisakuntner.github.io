//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider("BasemapAT.grau"); //das vom plugin dings rauskopieren. 
//https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
    fullscreenControl: true,
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray //muss hier nicht mehr den ganzen Link haben
    ]
});

let overlays = {
    stations: L.featureGroup(), //kann hier overlay objekte definieren definieren. besteht aus: key value pairs + einer feature group
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
    humidity: L.featureGroup()
};


//https://leafletjs.com/reference-1.7.1.html#control-layers
let layerControl = L.control.layers({ //zum basiskarten schalten oben in ecke .runde klammer für die funktion die ausgeführt wird, geschwungene wo wir das control konfigurieren
    "BasemapAT.grau": basemapGray, // key : value paare sind hier drinnen 
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT.surface": L.tileLayer.provider("BasemapAT.surface"),
    //https://leafletjs.com/reference-1.7.1.html#layergroup
    "BasemapAT.overlay+ortho": L.layerGroup([ //kombinieren
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
}, { //zum kombinieren basislayer --> layergroup über  
    "Wetterstationen in Tirol": overlays.stations,
    "Temperatur (°C)": overlays.temperature,
    "Schneehöhe (cm)": overlays.snowheight,
    "Windgeschwindigkeit (km/h)": overlays.windspeed,
    "Windrichtung": overlays.winddirection, //hiermit kann ich alles filtern, bzw überprüfen ob es eine Nummer ist.rlays.winddirection,
    "Relative Luftfeuchtigkeit (%)": overlays.humidity
}, {
    collapsed: false
}).addTo(map); //jetzt haben wir zwei layer drinnnen, einmal ortho einmal basemap
overlays.temperature.addTo(map);

//Maßstab einbauen
L.control.scale({
    imperial: false //sonst zeigt es die anzeige auch noch mal in miles
}).addTo(map);

let getColor = (value, colorRamp) => {
    //console.log("Wert:", value, "Palette: ", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col; //col weils im color.js so definiert ist neben min,max
        }
    }
    return "black"; //fals ein wert dabei ist der in der farbtabelle nicht dabei ist
};

let getDirections = (value, directions) => {
    for (let rule of directions) {
        if (value >= rule.min && value < rule.max) {
            return rule.dir;
        }
    }
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors); // übergabe value und name..
    let label = L.divIcon({
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], { //marker erstellen
        icon: label,
        title: `${options.station} (${coords[2]}m)` //wenn man mit maus drüber fahrt sieht man was es für ne station ist
    });
    return marker; //marker zurückliefern
};

let awsUrl = "https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson"; //wetterstationen daten aus dem link runterladen

fetch(awsUrl) //Neuer js befehl zum daten laden aus URL. response dann konvertieren in json
    .then(response => response.json()) //gibt oft probelme deswegen: mit "then" verarbeiten, und dnn nochmal then. sit wei lman über internet (fehleranfällige leitung) laden, deswegen so kompliziert machen.
    .then(json => { //damit ruf ich es dann auf kann mit dem json weiterarbeiten 
        console.log("Daten konvertiert: ", json); //printn
        for (station of json.features) {
            //console.log("Station: ", station); //kriege für jede station einen eintrag.
            //https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker([ //marker setzen
                station.geometry.coordinates[1], //länge als zweites und breite als erstes dswegn 0 u 1 weil des do umgetauscht ist
                station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            let direction = getDirections (station.properties.WR, DIRECTIONS); //ausführen der Fuktion getDirektion/Aufruf mit Wert der Windrichtung und dann an die Kategorisierung übergeben. ist jetzt in der Variablen direction gespeichert, die man fürs popup verwenden kann
            
            //popup mit marker infos erstellen: 
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe:${station.geometry.coordinates[2]} m</li>
                <li>Temperatur:${station.properties.LT} C</li>
                <li>Schneehöhe:${station.properties.HS || "?"} cm</li>
                <li>Windgeschwindigkeit:${station.properties.WG || "?"} km/h</li>
                <li>Windrichtung:${direction || "?"} </li> 
                <li>Luftfeuchtigkeit:${station.properties.RH || "?"} %</li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(overlays.stations); //marker zur karte fügen
            //abfragen ob wert zur schneehöhe vorhanden ist:
            if (typeof station.properties.HS == "number") { //überprüfene ob es eine nummr ist
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                }); //https://leafletjs.com/reference-1.7.1.html#divicon
                marker.addTo(overlays.snowheight); //kann damit filtern zwischen station mit schnee und ohne schneelayer.. 
            }
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }
            if (typeof station.properties.LT == "number") { //hiermit kann ich alles filtern, bzw überprüfen ob es eine Nummer ist.
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1),
                    colors: COLORS.temperature,
                    station: station.properties.name //übergebe an das label den namen derstation 
                });
                marker.addTo(overlays.temperature);
            }
            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(1),
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);
            }
        }
        //set map view to all stations
        map.fitBounds(overlays.stations.getBounds()); //karten-objekt(=fitBounds) soll an die grenzen ds aws layer gesetzt werden. 
    });
//minimap
    var miniMap = new L.Control.MiniMap(L.tileLayer.provider("BasemapAT.grau"), {
        toggleDisplay: true, //minimap ein und ausklappbar
        minimized: false //fangt im eingeklappten zustand an. diese einstellungen kann man alle in der leaflet/github davon nachlesen
    }).addTo(map);