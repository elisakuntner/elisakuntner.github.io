/* global L */
// Bike Trail Tirol Beispiel

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
    tracks: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})
// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
//Elecation control initialisieren
const elevationControl = L.control.elevation({
    elevationDiv: "#profile",
    followMarker: false,
    theme: "lime-theme",
}).addTo(map);

let activeElevationTrack; //var erstellen

const drawTrack = (nr) => {
    console.log("Track: ", nr);
    elevationControl.clear(); //löscht elevation data
    overlays.tracks.clearLayers(); //löscht gpx layers
    //bugfix for leaflet-elevatin plugin
    if (activeElevationTrack) {
        activeElevationTrack.removeFrom(map);
    }
    // for new browsers:
    activeElevationTrack?.removeFrom(map);
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true, //datei aus inet geladen, wartet mit dem bis es komplett geladen ist über server
        marker_options: {
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: 'icons/finish.png',
            shadowUrl: null, //wird mit null nicht angezeigt
        },
        polyline_options: {
            color: "black",
            dashArray: [2, 5], //linie wird strichliert
        },
    }).addTo(overlays.tracks); //Var definieren u auf den ordner tracks zugreifen
    gpxTrack.on("loaded", () => {
        console.log("loaded gpx");
        map.fitBounds(gpxTrack.getBounds());
    //popup
    gpxTrack.bindPopup(`
     <h3>${gpxTrack.get_name()}<h3>
     <ul>
        <li>minimale Höhe:  ${gpxTrack.get_elevation_min()}</li>
        <li>maximale Höhe:  ${gpxTrack.get_elevation_max()}</li>
        <li>Streckenlänge:  ${gpxTrack.get_distance()}</li>
    </ul>`);
    });
    elevationControl.load(`tracks/${nr}.gpx`); //aufpassen wo mans reinläd
    elevationControl.load (`tracks/${nr}.gpx`)
    activeElevationTrack = evt.layer;
};

const selectedTrack = 31;
drawTrack(selectedTrack);

//https://github.com/mpetazzoni/leaflet-gpx Leafletplugin für GPX dateien, schauen wie viele esverwenden, wann zuletzt kommitet usw.


//DROPDOWNMENU
console.log("biketirol json: ", BIKETIROL); // Werte in console anschauen u zugreifen. 
let pulldown = document.querySelector("#pulldown"); //so ole ich über die id eine referenz vovn einem element
console.log("Pulldown: ", pulldown); // schauen ob ichs richtig gemacht habe!! immer wieder machen! wenn die werte ausspuckt passts
for (let track of BIKETIROL) {
//damit die route auch zum selectierte nTrakc wechselt nach dem drop down:
    let selected = ""; // leere var erstellen für schleife
    if (selectedTrack == track.nr) { //nur wenn der selectierte trakc mti der nummer übereinstimmt wird es angezeigt
        selected = "selected";
    }else { selected = "";}
        pulldown.innerHTML += `<option value="${track.nr}">${track.nr}: ${track.etappe}</option>` //forschleife um die elemente aufzurufen, += immer eines weitergehen. aufpassen immer schreiben dass track.was ich will steht....
};

pulldown.onchange =() => {
    console.log("changed!", pulldown.value);
    drawTrack(pulldown.value) //mit dieser zeile kann man zwischen den routen wechseln.
} //jetzt bleiben alle routen in der karte.
//deswegen funktion clear siehe Zeile 55 u 56. 









