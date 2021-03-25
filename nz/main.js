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

let nav = document.querySelector("#navigation");
console.log(ROUTE);
ROUTE.sort((stop1, stop2) => {
    return stop1.nr > stop2.nr //mit größer kl zeichen, so sortiert er aufsteigend
}) //sortiert die elemente vom dropdownmenü
for (let entry of ROUTE){    
    //console.log(entry);

    nav.innerHTML += `
       <option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>
    `;

    let mrk = L.marker([entry.lat, entry.lng ]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><a href="${entry.wikipedia}"><i class="fas fa-external-link-alt mr-3"></i>Read about stop in Wikipedia</a></p> 
        `); //mit diesen marken kann man gut übersichtlich arbeiten.. aber ohne autocomplet, kann man ev ausserhalb von den back ``machen.
        
        if (entry.nr == 18) {
            map.setView([entry.lat, entry.lng], 13);
            mrk.openPopup();
        }
}


// nav.onchange = (evt) => {
//     let selected = evt.target.selectedIndex;
//     let options = evt.target.options;
//     let username =  options[selected].username;
//     let link = `https://${username}.github.io/nz/index.html`
//     console.log(username, link); //ist von der nummerierung her eins weniger als vom beginn. mit 0

// };

nav.onchange = (evt) => {
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username =options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    console.log(username, link);
};
//console.log(document.querySelector("#map"));