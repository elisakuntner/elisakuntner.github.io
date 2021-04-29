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

//Funktiondefinieren:
let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`strong>$feature.properties.Line_NAME)</strong>
            <hr>
            Station: ${feature.properties.STAT_Name}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop.png",
                    iconSitze: [38, 38]
                })
            })
        },
        attribution: '<a href="https://data.wien-gv.at"</a>, <a href="https://mapicons.mapsmarker.com/">Maps Icons Collections</a>'
    }).addTo(map);
}

let drawLine = (geojsonData => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup((`strong>$feature.properties.Line_NAME)</strong>
            <hr>
            Line: ${feature.properties.LINE_Name}`))
        }
    })
})

//Schleife schreiben die über das ogdwien drüberläuft: --> gleiches wie Oberes ausgeklammert
for (let config of OGDWIEN) {
    console.log("Congig: ", config.data); //console log schreibt was ins consolefenster rein
    fetch(config.data) //schleife machen mit fetch, der uns die daten ladet, die im data drin sind
        .then(response => response.json()) //innere runde klammer: Funktionsaufruf, damit es gestartet / ausgeführt wird ! 
        .then(geojsonData => {
            console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") //wenn es die Haltestellen sind:
                drawBusStop(geojsonData);
            if (config.title == "Liniennetz Vienna Sightseeing")
                drawLine(geojsonData);
                //L.geoJson(geojsonData).addTo(map) //alle geladenen Datensätze erden auf karte visualisiert.
        }) //weiß nicht welche daten pr oschleife aufgerufen werden, desewgen nenne ich s geojson Data

}