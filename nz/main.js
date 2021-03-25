// console.log("Hello World");
// console.log(L);
let stop = {
    nr: 18,
    name: "Abel Tasman National Park",
    lat: -40.833333, 
    lng: 172.9
    user: "elisakuntner",
    wikipedia: "https://en.wikipedia.org/wiki/Abel_Tasman_National_Park"

}


const map = L.map("map",{
    center: [ stop.lat, stop.lng ], //coordinaten einfügen
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([stop.lat, stop.lng ]); addTo(map);
mrk.bindPopup("Abel Tasman National Park").openPopup();


console.log(document.querySelector("#map"))