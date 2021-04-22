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
    winddirection: L.featureGroup()
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
        "Temperatur (°C):": overlays.temperature,
        "Windgeschwindigkeit, km/h": overlays.windspeed,
        "Windrichtung": overlays.winddirection,
},{
        collapsed: false
}).addTo(map); //jetzt haben wir zwei layer drinnnen, einmal ortho einmal basemap
overlays.temperature.addTo(map);

//Maßstab einbauen
L.control.scale({
    imperial: false //sonst zeigt es die anzeige auch noch mal in miles
}).addTo(map);

let newLabel = (coords, options) => {
    let label = L.divIcon({
        html: `<div>${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker ([coords[1], coords [0]], { //marker erstellen
        icon: label
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
            marker.addTo(overlay.stations); //marker zur karte fügen
            
            //abfragen ob wert zur schneehöhe vorhanden ist:
            if (typeof station.properties.HS == "number") {
                if (typeof  station.properties.HS == "number") { //hiermit kann ich alles filtern, bzw überprüfen ob es eine Nummer ist.
                    let marker = newLabel(station.geometry.coordinates, {
                        value: station.properties.HS
                    });
                //https://leafletjs.com/reference-1.7.1.html#divicon
                snowMarker.addTo(overlays.snowheight); //kann damit filtern zwischen station mit schnee und ohne schneelayer.. 
            }

            if (typeof station.properties.WG == "number") {
                if (typeof  station.properties.WG == "number") { //hiermit kann ich alles filtern, bzw überprüfen ob es eine Nummer ist.
                    let marker = newLabel(station.geometry.coordinates, {
                        value: station.properties.WG
                    });
                windMarker.addTo(overlays.windspeed);
            }
            if (typeof  station.properties.LT == "number") { //hiermit kann ich alles filtern, bzw überprüfen ob es eine Nummer ist.
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT
                });
                marker.addTo(overlays.temperature);
            }
        }
        //set map view to all stations
        map.fitBounds(overlays.stations.getBounds()); //karten-objekt(=fitBounds) soll an die grenzen ds aws layer gesetzt werden. 
    });

