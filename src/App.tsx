import { useState } from "react";

type WeatherType = {
  name: string;
  temp: number;
  wind: number;
};

export default function App() {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherType | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Get city coordinates
  async function fetchCoordinates(cityName: string) {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("City not found");
    }
    return data.results[0];
  }

  // Get weather data
  async function fetchWeather() {
    if (!city.trim()) {
      setError("Please enter a city");
      return;
    }

    try {
      setError("");
      setWeather(null);
      setLoading(true);

      const location = await fetchCoordinates(city.trim());

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`
      );
      const data = await res.json();

      if (!data.current_weather) {
        throw new Error("Weather data not found");
      }

      setWeather({
        name: location.name,
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 text-white text-center w-[350px] max-w-full">
        <h1 className="text-3xl font-bold mb-6">🌤️ Weather Now</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
            className="p-2 rounded text-black flex-1 outline-none"
          />
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {loading && <p className="text-yellow-400">Loading...</p>}
        {error && <p className="text-red-600 font-bold">{error}</p>}

        {weather && (
          <div className="bg-white text-black rounded-xl shadow-lg p-6 mt-4 transition-all duration-300 ease-in-out">
            <h2 className="text-xl font-bold">{weather.name}</h2>
            <p className="text-lg">🌡️ Temp: {weather.temp} °C</p>
            <p>💨 Wind: {weather.wind} km/h</p>
          </div>
        )}
      </div>
    </div>
  );
}
