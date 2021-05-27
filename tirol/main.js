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
    tracks: L.featureGroup(),
    wikipedia: L.featureGroup(),
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
    "GPX-Tracks": overlays.tracks,
    "Wikipedia-Artikel": overlays.wikipedia,
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
overlays.wikipedia.addTo(map);

//Elecation control initialisieren
const elevationControl = L.control.elevation({
    elevationDiv: "#profile",
    followMarker: false,
    theme: "lime-theme",
}).addTo(map);

//Wikipedia Artikel Zeichnen username=meinusername 
let articleDrawn = {}; //variable erstellen zum schauen ob schon gezeichnet ist wegen zoom und pan einbau
const drawWikipedia = (bounds) => {
    

    //console.log(bounds); 
    //URL VERÄNDERN: github seiten laufen auf https und wenn man das mit https vermischt bekommt man eine warnung, also immer umändern. dann ändert man api in secure wei ldas der server sit üebr den das sichere läuft. 
    let url = `https://secure.geonames.org/wikipediaBoundingBoxJSON?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&username=elisakuntner&lang=de&maxRows=30`;
    //style full konnte man löschen. und dann müsse wir noch die koordinaten ändern im template string mit  $. dann am ende mit &lang=de diesprache auf deutsch stellen & mit max Rows kann man anzalh der ergebnisse einstellen ( defaultist glaub i 10)
    //console.log(url);

//**Icons einkopieren. besteht aus key value pairs - definieren die verschiedenen Icon marker
    let icons = {
        adm1st: "wikipedia_administration.png",
        adm2nd: "wikipedia_administration.png",
        adm3rd: "wikipedia_administration.png",
        airport: "wikipedia_helicopter.png",
        city: "wikipedia_smallcity.png",
        glacier: "wikipedia_glacier-2.png",
        landmark: "wikipedia_landmark.png",
        railwaystation: "wikipedia_train.png",
        river: "wikipedia_river-2.png",
        mountain: "wikipedia_mountains.png",
        waterbody: "wikipedia_lake.png",
        default: "wikipedia_information.png",
    };

    //URL bei genoames.org aufrufen und JSON-Daten abholen, fetch ist immer aufruf ins netz um was zu holen 
    fetch(url).then(
        response => response.json()
    ).then(jsonData => {
        //console.log(jsonData);
//**Artikle Marker erzeugen: dazu Arrays in einer forschleife aufrufen
        for (let article of jsonData.geonames) {
            //habe ich den article shon gezeichnet?
            if (articleDrawn [article.wikipediaUrl]) {
                //Ja, nicht noch einmal zeichnen
                //console.log("schon gesehen", artciel.wikipediaUrl) //schauen ob u wie oft es auftritt
                continue; //darunterliegender code wird nicht ausgeführt, bzw. geht zum nächsten article
            } else {
                articleDrawn[article.wikipediaUrl] = true; //
            }
            //welches icon sol verwendet werden?? mit if abfragen
            //bekannte icons 
            if (icons[article.feature]) {
            //generisches Info Icon
            }else {
                article.feature = "default";
            }
            let mrk = L.marker([article.lat, article.lng], {//**marker , braucht zuerst koordinaten, dann werden die icons eingebaut, die oben definiert wruden. w
                icon: L.icon({ //**icon ist ein propertie mit L.icon u das hat wieder properties. liegen im icons verzeichnis
                    iconUrl: `icons/${icons[article.feature]}`, //name der icons 
                    iconSize: [32, 37], //array höhe u breite, kann ich im img anschauen. mit der size ist der icon mittig, aber die iconspitze liegt nicht auf koordinate. also;
                    iconAnchor: [16, 37], //damit richitg positioniert, aber verdeckt durchpopup
                    popupAnchor: [0, -37], //mitte passt =0, dann nach oben verschieben um icongröße, dann gehts oberhalb auf
                })
            });

            mrk.addTo(overlays.wikipedia);
            //**optionales Bild definieren (für popup)
            let img = "";
            if (article.thumbnailImg) {
                img = `<img src="${article.thumbnailImg}"
                alt="thumbnail"`
            }
            //Popup definieren
            mrk.bindPopup(`
            <small>${article.feature}</small>
            <h3>${article.title}(${article.elevation}m)</h3>
            ${img}
            <p>${article.summary}</p>
            <a target="Wikipedia" href="https://${article.wikipediaUrl}">Wikipedia-Artikel</a>
            `) //Feature in small (klein ) hinschreiben. dann werden elemente dazugefügt. target: beim ersten mal wird ein neues geöffnet, und beim nächsten mal geht auch wieder dorthin
            
        }
    });
};


let activeElevationTrack; //var erstellen

//Hoehenprofil Zeichnen Funktion:
const drawTrack = (nr) => {
    //console.log("Track: ", nr);
    elevationControl.clear(); //löscht elevation data
    overlays.tracks.clearLayers(); //löscht gpx layers
    //bugfix for leaflet-elevatin plugin
    if (activeElevationTrack) {
        activeElevationTrack.removeFrom(map);
    }
    // for new browsers:
    //activeElevationTrack?.removeFrom(map);
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
        //console.log("loaded gpx");
        map.fitBounds(gpxTrack.getBounds());
        //popup
        gpxTrack.bindPopup(`
     <h3>${gpxTrack.get_name()}<h3>
     <ul>
        <li>minimale Höhe:  ${gpxTrack.get_elevation_min()}</li>
        <li>maximale Höhe:  ${gpxTrack.get_elevation_max()}</li>
        <li>Streckenlänge:  ${gpxTrack.get_distance()}</li>
        <li>Höhenmeter bergauf: ${gpxTrack.get_elevation_gain()} m</li>
        <li>Höhenmeter bergab: ${gpxTrack.get_elevation_loss()} m</li>
    </ul>`);


    });
    elevationControl.load(`tracks/${nr}.gpx`); //aufpassen wo mans reinläd
    elevationControl.on("eledata_loaded", (evt) => {
        acitveElevationTrack = evt.layer;
    });
};


const selectedTrack = 31;
drawTrack(selectedTrack);
//Fkt update text
const updateTexts = (nr) => {
    console.log(nr);
};
//https://github.com/mpetazzoni/leaflet-gpx Leafletplugin für GPX dateien, schauen wie viele esverwenden, wann zuletzt kommitet usw.


//DROPDOWNMENU
//console.log("biketirol json: ", BIKETIROL); // Werte in console anschauen u zugreifen. 
let pulldown = document.querySelector("#pulldown"); //so ole ich über die id eine referenz vovn einem element
//console.log("Pulldown: ", pulldown); // schauen ob ichs richtig gemacht habe!! immer wieder machen! wenn die werte ausspuckt passts
let selected = ""; // leere var erstellen für schleife
for (let track of BIKETIROL) {
    //damit die route auch zum selectierte nTrakc wechselt nach dem drop down:
    if (selectedTrack == track.nr) { //nur wenn der selectierte trakc mti der nummer übereinstimmt wird es angezeigt
        selected = "selected";
    } else {
        selected = "";
    }
    pulldown.innerHTML += `<option ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>` //forschleife um die elemente aufzurufen, += immer eines weitergehen. aufpassen immer schreiben dass track.was ich will steht....
};
//erstes mal funktionsaufruf update texts: Metadaten der Etappe update
updateTexts(pulldown.value);

pulldown.onchange = () => {
    //console.log("changed!", pulldown.value);
    drawTrack(pulldown.value) //mit dieser zeile kann man zwischen den routen wechseln.
    //Metadaten der Etappe updaten
    updateTexts(pulldown.value); //bei mwechsel in eine etappe kommt in er konsole die etappennummer.
} //jetzt bleiben alle routen in der karte. deswegen funktion clear siehe Zeile 55 u 56. 


//ICons sollen sich bei zoom verändern!
map.on("zoomend moveend", () => {
       // Wikipedia Artikel zeichnen
 drawWikipedia(map.getBounds()); //map hinzguefügt weil es die ganze karte geht
});
     