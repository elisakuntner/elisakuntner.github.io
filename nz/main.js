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
    //center: [ stop.lat, stop.lng ], //coordinaten einfügen. kann ich hier auskommentieren, weil in Z31
    //zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
console.log(ROUTE);
for (let entry of ROUTE){
    console.log(entry);

    let mrk = L.marker([entry.lat, entry.lng ]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><a href="${entry.wikipedia}">i class="fas fa-external-link-alt mr-3"></i>Read about stop in Wikipedia</a></p>
        `); //mit diesen marken kann man gut übersichtlich arbeiten.. aber ohne autocomplet, kann man ev ausserhalb von den bakc ``machen.
        
        if (entry.nr == 18) {
            map.setView([entry.lat, entry.lng], 13);
            mrk.openPopup();
        }
}

console.log(document.querySelector("#map"));