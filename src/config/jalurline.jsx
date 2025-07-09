import {useMap} from "react-leaflet"
import {useEffect} from "react"
import L from "leaflet"
import "leaflet-polylinedecorator"

export default function DirectionArrowDecorator({polylineCoords}) {
 const map = useMap()

 useEffect(() => {
  if (!map || polylineCoords.length < 2) return

  const latlngs = polylineCoords.map(([lat, lng]) => L.latLng(lat, lng))

  const decorator = L.polylineDecorator(latlngs, {
   patterns: [
    {
     offset: 20,
     repeat: 100,
     symbol: L.Symbol.arrowHead({
      pixelSize: 10,
      headAngle: 50,
      polygon: false,
      pathOptions: {
       stroke: true,
       color: "white",
       weight:3,
       opacity: 1
      }
     })
    }
   ]
  })

  decorator.addTo(map)

  return () => {
   map.removeLayer(decorator)
  }
 }, [map, polylineCoords])

 return null
}
