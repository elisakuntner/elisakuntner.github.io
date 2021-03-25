// console.log("Hello World");
// console.log(L);
const map = L.map("map"), {
    center: [ -40.50, 172.54 ], //coordinaten einfügen
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([-40.50, 172.54 ]); addTo(map);
mrk.bindPopup("Abel Tasman National Park").openPopup();


// console.log(document.querySelector("#map"))