//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider("BasemapAT.grau"); //das vom plugin dings rauskopieren. 
//https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
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
};
//https://leafletjs.com/reference-1.7.1.html#control-layers
let layerControl = L.control.layers({ //zum basiskarten schaten oben in ecke .runde klammer für die funktion die ausgeführt wird, geschwungene wo wir das control konfigurieren
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
        "Temperatur (°C):": overlays.temperature,
        "Windgeschwindigkeit, km/h": overlays.windspeed,
        "Windrichtung": overlays.winddirection,
        }  
}) .addTo(map); //jetzt haben wir zwei layer drinnnen, einmal ortho einmal basemap

let awsUrl = "https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson"; //wetterstationen daten aus dem link runterladen




//feature gruppen erstellen // https://leafletjs.com/reference-1.7.1.html#featuregroup
let awsLayer = L.featureGroup(); //aus leafletbib eine funktion. damit kann ich die wetterstationen aus u einschalten / die anzeige davon
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol"); //zweiter parameter ist ein name
//awsLayer.addto(map); 
let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhen(cm)");
//snowLayer.addTo(map);
let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeiten (km/h)");
//windLayer.addTo(map); //wird beim Website öffnen eingeblendet/ ist aktiviert mit addTo(map)
//temperaturlayer
let temperaturLayer = L.featureGroup();
layerControl.addOverlay(temperaturLayer, "Lufttemperatur (°C)");
temperaturLayer.addTo(map);

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

            //popup mit marker infos erstellen: 
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe:${station.geometry.coordinates[2]} m</li>
                <li>Temperatur:${station.properties.LT} C</li>
                <li>Luftfeuchtigkeit:${station.properties.RH || "?"} </li>
                <li>Schneehöhe:${station.properties.HS || "?"} cm</li>
                <li>Windgeschwindigkeit:${station.properties.WG || "?"} km/h</li>
                <li>Windrichtung:${station.properties.WR || "?"} </li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(awsLayer); //marker zur karte fügen
            //abfragen ob wert zur schneehöhe vorhanden ist:
            if (station.properties.HS) {
                let highlightClass = "";
                if (station.properties.HS > 100) {
                    highlightClass = "snow-100";
                }
                if (station.properties.HS > 200) {
                    highlightClass = "snow-200";
                }
                //https://leafletjs.com/reference-1.7.1.html#icon
                let snowIcon = L.divIcon({
                    html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>` //schneehöhe steht da af dr kort
                })

                let snowMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(snowLayer); //kann damit filtern zwischen station mit schnee und ohne schneelayer.. 
            }

            if (station.properties.WG) {
                let windHighlightClass = "";
                if (station.properties.WG > 10) {
                    windHighlightClass = "wind-10";
                }
                if (station.properties.WG > 20) {
                    windHighlightClass = "wind-20";
                }
                let windIcon = L.divIcon({
                    html: `<div class="wind-label ${windHighlightClass}">${station.properties.WG}</div>`,
                });
                let windMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(windLayer);
            }


            if (station.properties.LT) {
                let temperatureHighlightClass = "";
                if (station.properties.LT <= 0) {
                    temperatureHighlightClass = "temperature-kl0";
                }
                if (station.properties.LT > 0) {
                    temperatureHighlightClass = "temperature-gr0";
                }
                let temperatureIcon = L.divIcon({
                    html: `<div class="temperature-label ${temperatureHighlightClass}">${station.properties.LT}</div>`,
                });
                let temperatureMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: temperatureIcon
                });
                temperatureMarker.addTo(temperatureLayer);
            }
        }
        //set map view to all stations
        map.fitBounds(awsLayer.getBounds()); //karten-objekt(=fitBounds) soll an die grenzen ds aws layer gesetzt werden. 
    });