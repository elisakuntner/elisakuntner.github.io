let basemapGray = L.tileLayer.provider("BasemapAT.grau"); //das vom plugin dings rauskopieren. 

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray //muss hier nicht mehr den ganzen Link haben
    ]
});

let layerControl = L.control.layers({ //runde klammer für die funktion die ausgeführt wird, geschwungene wo wir das control konfigurieren
    "BasemapAT.grau": basemapGray, // key : value paare sind hier drinnen 
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT.surface": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT.overlay": L.tileLayer.provider("BasemapAT.overlay"), //geht gut zum kombinieren mit dem orthofoto
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay"),
    ])  //zum kombinieren basislayer --> layergroup über    
}) .addTo(map);//jetzt haben wir zwei layer drinnnen, einmal ortho einmal basemap


let awsUrl = "https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson" //wetterstationen daten aus dem link runterladen

//feature gruppe erstellen
let awsLayer = L.featureGroup(); //aus leafletbib eine funktion. damit kann ich die wetterstationen aus u einschalten / die anzeige davon
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol"); //zweiter parameter ist ein name
awsLayer.addto(map); //damit werden die layer der stationen von anfang an eingeblendet.
let snowLayer = L.featureGroup();

fetch(awsUrl)//Neuer js befehl zum daten laden aus URL.
    .then(response => response.json())//gibt oft probelme deswegen: mit them then verarbeiten, und dnn nochmal then. sit wei lman über internet (fehleranfällige leitung) laden, deswegen so kompliziert machen.
    .then(json => {  //damit ruf ich es dann auf kann mit dem json weiterarbeiten 
        console.log("Daten geladen: ", json); //printn
        for (station of json.features) {
            console.log("Station: ", station); //kriege für jede station einen eintrag.
            let marker = L.marker( //marker setzen
                [station.geometry.coordinates[1], //länge als zweites und breite als erstes dswegn 0 u 1 weil des do umgetauscht ist
                station.geometry.coordinates[0]
            ]);
            let foramttedDate = new Date(station.properties.date); 
            
            //popup mit marker infos erstellen: 
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe:${station.geometry.coordinates[2]} m</li>
                <li>Temperatur:${station.properties.LT || "?"} C</li>
                <li>Luftfeuchtigkeit:${station.properties.RH || "?"} </li>
                <li>Schneehöhe:${station.properties.HS || "?"} cm</li>
                <li>Windgeschwindigkeit:${station.properties.WG || "?"} km/h</li>
                <li>Windrichtung:${station.properties.WR || "?"} </li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(awsLayer); //marker zur karte fügen
            //abfragen ob wert zur schneehöhe vorhanden ist:
            if  (station.properties.HS) {
                let snowIcon = L.divIcon({
                    html: `<div>XXXirgendwasXXX</div>`
                })
                let snowMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0],
                ]);
                snowMarker.addTo(snowLayer); //kann jetzt filtern zwischen station mit schnee und ohne schneelayer.. 
            }
        }
        
        //set map view to all stations
        map.fitBounds(awsLayer.getBounds()); //karten-objekt(=fitBounds) soll an die grenzen ds aws layer gesetzt werden. 
});