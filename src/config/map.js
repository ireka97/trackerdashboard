const MAP_LAYERS = {
 OpenStreetMap: {
  name: "OpenStreetMap",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© MyTracking App 2025",
  thumbnail: "/public/mapthumbnail/osm.png"
 },
 satellite: {
  name: "Esri Satellite",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "© MyTracking App 2025",
  thumbnail: "/public/mapthumbnail/citra.png"
 },
 OpenTopo: {
  name: "Carto Topo",
  url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  attribution: "© MyTracking App 2025",
  thumbnail: "/public/mapthumbnail/topo.png"
 }
}

export { MAP_LAYERS };
