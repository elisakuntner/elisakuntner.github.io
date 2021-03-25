// console.log("Hello World");
// console.log(L);
let stop = {
    nr: 18,
    name: "Abel Tasman National Park",
    lat: -40.833333, 
    lng: 172.9,
    user: "elisakuntner",
    wikipedia: "https://en.wikipedia.org/wiki/Abel_Tasman_National_Park"

}

const map = L.map("map",{
    center: [ stop.lat, stop.lng ], //coordinaten einfügen
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([stop.lat, stop.lng ]); addTo(map);
mrk.bindPopup(`
    <h4>Stop ${stop.nr}: ${stop.name}</h4>
    <p>>a href="${stop.wikipedia}">Read about stop in Wikipedida</a></p>
    `).openPopup(); //mit diesen marken kann man gut übersichtlich arbeiten.. aber ohne autocomplet, kann man ev ausserhalb von den bakc ``machen.


console.log(document.querySelector("#map"));