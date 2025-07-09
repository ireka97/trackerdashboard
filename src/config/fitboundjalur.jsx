// src/components/map/FitBoundsToJalur.jsx
import {useEffect} from "react"
import {useMap} from "react-leaflet"

export default function FitBoundsToJalur({bounds}) {
 const map = useMap()

 useEffect(() => {
  if (bounds && bounds.length === 2) {
   map.fitBounds(bounds)
  }
 }, [bounds, map])

 return null
}
