// console.log("Hello World");
// console.log(L);
const map = L.map("map"), {
    center: [ -40.50, 172.54 ], //coordinaten einfügen
    zoom: 13
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org{z}/{x}/{y}.png")
    ]

};
console.log(document.querySelector("#map"))
//Abel-Tasman-Nationalpark