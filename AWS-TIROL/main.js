let basemapGray = L.tileLayer.provider("BasemapAT.grau"); //das vom plugin dings rauskopieren. 

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray //muss hier nicht mehr den ganzen Link haben
    ]
});

let layerConrol = L.control.layers({ //runde klammer für die funktion die ausgeführt wird, geschwungene wo wir das control konfigurieren
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
fetch(awsUrl)//Neuer js befehl zum daten laden aus URL.
.then(response => response.json())//gibt oft probelme deswegen: mit them then verarbeiten, und dnn nochmal then. sit wei lman über internet (fehleranfällige leitung) laden, deswegen so kompliziert machen.
    .then(json => {  //damit ruf ich es dann auf kann mit dem json weiterarbeiten 
        console.log("Daten geladen: ", json); //printn
        for (station of json.features) {
            console.log("Station: ", station); //kriege für jede station einen eintrag.
            let marker = L.marker( //marker setzen
                [station.geometry.coordinates[1], //länge als zweites und breite als erstes dswegn 0 u 1 weil des do umgetauscht ist
                station.geometry.coordinates[0]]
                );
            marker.addTo(map); //marker zur karte fügen
        }
});