// utils/weather.js
export async function getWeatherByLatLng(lat, lon, apiKey) {
 const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=id&appid=${apiKey}`

 const res = await fetch(url)
 if (!res.ok) throw new Error("Gagal mengambil data cuaca")

 const data = await res.json()

 return {
  temp: data.main.temp,
  humidity: data.main.humidity,
  condition: data.weather[0].main,
  icon: data.weather[0].icon,
  description: data.weather[0].description
 }
}
