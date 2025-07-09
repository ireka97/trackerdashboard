const MAP_LAYERS = {
 OpenStreetMap: {
  name: "OpenStreetMap",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© MyTracking App 2025"
 },
 satellite: {
  name: "Esri Satellite",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "© MyTracking App 2025"
 },
 dark: {
  name: "Carto Dark",
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution: "© MyTracking App 2025"
 },
 OpenTopo: {
  name: "Carto Topo",
  url: "https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=Jxp4TLdXBcwfaRL7Xl7l",
  attribution: "© MyTracking App 2025"
 }
}

export { MAP_LAYERS };
