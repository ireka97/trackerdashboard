const MAP_LAYERS = {
 OpenStreetMap: {
  name: "OpenStreetMap",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© MyTracking App 2025",
  thumbnail: "https://openmaptiles.org/img/styles/openmaptiles.png"
 },
 satellite: {
  name: "Esri Satellite",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "© MyTracking App 2025",
  thumbnail:
   "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3Ya_I4fQvPPKYNbbKQ5UpI6dbFPwD4y-Ch8lYHynurWnrSJc6rEqRSGtNziNvbJPBmSk36ocZLZkeHk4njmaaFFobZBv7IoIreWmHCulKzl0xNd3m0-Vygw1Imo9Che2SPx6Qo_mnl88/s1600/MONAS.jpg"
 },
 OpenTopo: {
  name: "Carto Topo",
  url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  attribution: "© MyTracking App 2025",
  thumbnail: "https://upload.wikimedia.org/wikipedia/commons/3/3d/OpenTopomap_Meiningen.jpg"
 }
}

export { MAP_LAYERS };
           
