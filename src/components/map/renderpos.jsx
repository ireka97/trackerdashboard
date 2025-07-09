import React, {useEffect, useState} from "react"
import {Marker, Popup} from "react-leaflet"
import {getLeafletIconFromConfig} from "../../config/markericon"
import {getWeatherByLatLng} from "../../config/weather"

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export default function RenderPosMarkers({markers}) {
 const [weatherData, setWeatherData] = useState({}) // key = index

 useEffect(() => {
  markers.forEach(async (m, idx) => {
   const [lat, lon] = [m.geometry.coordinates[1], m.geometry.coordinates[0]]
   try {
    const weather = await getWeatherByLatLng(lat, lon, WEATHER_API_KEY)
    setWeatherData((prev) => ({...prev, [idx]: weather}))
   } catch (err) {
    console.error(`Gagal fetch cuaca untuk pos ${m.nama_pos}`, err)
   }
  })
 }, [markers])

 return markers.map((m, idx) => (
  <Marker
   key={`pos-${idx}`}
   position={[m.geometry.coordinates[1], m.geometry.coordinates[0]]}
   icon={getLeafletIconFromConfig(m.icon)}>
   <Popup>
    <b>{m.nama_pos}</b>
    <br />
    {m.description}
    <hr />
    {weatherData[idx] ? (
     <>
      <img
       src={`https://openweathermap.org/img/wn/${weatherData[idx].icon}@2x.png`}
       alt={weatherData[idx].condition}
       style={{backgroundColor: "#e0e0e0", borderRadius: "4px", padding: "4px"}}
      />
      <div>
       <b>{weatherData[idx].description}</b>
       <br />
       <span>Suhu: {weatherData[idx].temp}°C </span>
       <br />
       <span>Kelembaban: {weatherData[idx].humidity}%</span>
      </div>
     </>
    ) : (
     <em>Memuat data cuaca...</em>
    )}
   </Popup>
  </Marker>
 ))
}
