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
    busStops: L.featureGroup(),
    pedAreas: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
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
    "Fußgängerzonen": overlays.pedAreas
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);


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
//Schleife schreiben die über das ogswien drüberläuft:
for (let config of OGDWIEN) {
    console.log("Congig: ", config.data); //console log schreibt was ins consolefenster rein
    fetch(config.data) //schleife machen mit fetch, der uns die daten ladet, die im data drin sind
        .then(response => response.json()) //innere runde klammer: damit es gestartet / ausgeführt wird ! 
        .then(geojsonData => {
            console.log("Data: ", geojsonData);
        }) //weiß nicht welche daten pr oschleife aufgerufen werden, desewgen nenne ich s geojson Data
}



