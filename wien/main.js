// OGD-Wien Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(), //jetzt sind die busstops in markenclsuter dargestellt, weil ich nicht mehr featreGroub stehen habe.  //wie featuregroup aber beherscht clustering, manchmal rutscht eins raus, bei zoom
    pedAreas: L.featureGroup(),
    sightSeeing: L.featureGroup(),
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true, //benötigt cdnsj verlinkung in index.html
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.sightSeeing
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.sightSeeing.addTo(map);

// fetch("data/TOURISTIKHTSVSLOGD.json")
//     .then(response => response.json()) //wieder wenn er erfolgreich geladen ist, dann...
//     .then(stations => {
//         L.geoJson(stations, { //wir laden stations und dann ein objekt in den geschwungenen Klammern
//             onEachFeature: (feature, layer) => {
//                 layer.bindPopup(feature.properties.STAT_NAME)
//             },
//             pointToLayer: (geoJsonPoint, latlng) => {
//                 return L.marker(latlng, {
//                     icon: L.icon({
//                         iconUrl: "icons/busstop.png",
//                         iconSitze: [38, 38]
//                     })
//                 })
//             }
//         }).addTo(map);
//     })

//Funktiondefinieren:
let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop.png",
                    iconSize: [38, 38]
                })
            })
        },
        //attribution: '<a href="https://data.wien-gv.at"</a>, <a href="https://mapicons.mapsmarker.com/">Maps Icons Collections</a>'
        attribution: "<a href='https://data.wien.gv.at'>Stadt Wien</a>"
    }).addTo(overlays.busStops);
}

let drawBusLines = (geojsonData) => {
    console.log("Bus Lines: ", geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => { //farben der linien ändern: 
            let col = COLORS.buslines[feature.properties.LINE_NAME]; //Eckige Klammern weil ich in einem Objekt auf einen wert/Schlüssel zureifen will, der ein Leerzeichen aht
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von ${feature.properties.FROM_NAME}<br>
            nach ${feature.properties.TO_NAME}
            `)
        },
        attribution: "<a href='https://data.wien.gv.at'>Stadt Wien</a>"
    }).addTo(overlays.busLines);
}

let drawPedestrianAreas = (geojsonData) => {
    console.log("Zone: ", geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => {
            return {
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.3
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM || ""}<br>
            ${feature.properties.AUSN_TEXT|| ""}
            `);
        },
        attribution: "<a href='https://data.wien.gv.at'>Stadt Wien</a>"
    }).addTo(overlays.pedAreas);
}

let drawsightSeeing = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong>
            <hr>
            Sehenswürdigkeit: ${feature.properties.NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/sehenswuerdigogd.png",
                    iconSize: [30, 30]
                })
            })
        },
        attribution: "<a href='https://data.wien.gv.at'>Stadt Wien</a>"
    }).addTo(overlays.sightSeeing);
}

//Schleife schreiben die über das ogdwien drüberläuft: --> gleiches wie Oberes ausgeklammert
for (let config of OGDWIEN) {
    console.log("Config: ", config.data); //console log schreibt was ins consolefenster rein
    fetch(config.data) //schleife machen mit fetch, der uns die daten ladet, die im data drin sind
        .then(response => response.json()) //innere runde klammer: Funktionsaufruf, damit es gestartet / ausgeführt wird ! 
        .then(geojsonData => {
            console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") { //wenn es die Haltestellen sind:
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") { //mit else if wird die zweite abfrage immer ausgeführt
                drawBusLines(geojsonData); //L.geoJson(geojsonData).addTo(map) //alle geladenen Datensätze erden auf karte visualisiert.
            } else if (config.title == "Fußgängerzonen") {
                drawPedestrianAreas(geojsonData);
            } else if (config.title == "Sehenswürdigkeiten Vienna Sightseeing") {
                drawsightSeeing(geojsonData);
            }
        }) //weiß nicht welche daten pro schleife aufgerufen werden, desewgen nenne ich s geojson Data

}



//Leaflet hash
//var hash = new L.Hash(map); //Var hash steht hier nur weil man eine neue Var erstellt, falls man sie später noch mal braucht. new  --> nach L muss großbuchstabe sein.
//kürzere schreibweise um es der map dazuzugeben: 
L.hash(map);

var miniMap = new L.Control.MiniMap(L.tileLayer.provider("BasemapAT.grau"), {
    toggleDisplay: true, //minimap ein und ausklappbar
    minimized: false //fangt im eingeklappten zustand an. diese einstellungen kann man alle in der leaflet/github davon nachlesen
}).addTo(map);

//reachability plugin

//Styling the reachability polygons: mit einer funktion die die option angibt unddie farbe (will fürverschiedenen erreichbarkeit (schwer) andere farbe.) vor plugin aufruf, damitichs dann hab untn
//funktion
let styleIntervals = (feature) =>{
    console.log(feature.properties); //kann nachschauen mit welchen range/properties intervals arbeitet, um dann die farben auszuwäheln..

}

//Reachability
L.control.reachability({
    //add settings/options here
    apiKey: "5b3ce3597851110001cf624806fb953f549242eabf4fb64d49de6960",
    styleFn: styleIntervals, //Fktaufruf
    drawButtonContent: '',
    drawButtonStyleClass: 'fa fa-pencil-alt fa-2x',
    deleteButtonContent: '',
    deleteButtonStyleClass: 'fa fa-trash fa-2x', //im quelltext nachschaune mit F12 im browser ---> icons werdne mit fa-2x vergrößert/größe verdoppelt
    distanceButtonContent: '',
    distanceButtonStyleClass: 'fa fa-road fa-2x',
    timeButtonContent: '',
    timeButtonStyleClass: 'far fa-clock fa-2x',
    travelModeButton1Content: '',
    travelModeButton1StyleClass: 'fa fa-car fa-2x',
    travelModeButton2Content: '',
    travelModeButton2StyleClass: 'fa fa-bicycle fa-2x',
    travelModeButton3Content: '',
    travelModeButton3StyleClass: 'fa fa-male fa-2x',
    travelModeButton4Content: '',
    travelModeButton4StyleClass: 'fas fa-wheelchair fa-2x',
}).addTo(map);

