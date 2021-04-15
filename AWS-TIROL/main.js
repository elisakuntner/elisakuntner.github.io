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
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto")
    //noch einpaar layer einbauen!!
}) .addTo(map);//jetzt haben wir zwei layer drinnnen, einmal ortho einmal basemap