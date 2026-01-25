import axios from "axios";

const getIcon = (icon: string) => {
  switch (icon.slice(0, -1)) {
    case "01":
      return "☀️";
    case "02":
      return "🌤️";
    case "03":
      return "☁️";
    case "04":
      return "☁️";
    case "09":
      return "🌧️";
    case "10":
      return "🌦️";
    case "11":
      return "🌩️";
    case "13":
      return "❄️";
    case "50":
      return "🌫️";
  }
};

export const getWeather = async () => {
  const { data }: { data: OpenWeatherI } = await axios(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        q: "Уфа",
        appid: process.env.OPEN_WEATHER_API_KEY,
        lang: "ru",
        units: "metric",
      },
    }
  );
  // const { data }: { data: OpenWeatherI } = await axios(
  //   `https://api.openweathermap.org/data/2.5/weather?lat=54,7431&lon=55,9678&appid=${process.env.OPEN_WEATHER_API_KEY}`
  // );

  return `Погода в городе ${data.name}
${getIcon(data.weather[0].icon)} ${data.weather[0].description[0].toUpperCase() + data.weather[0].description.substring(1)}, ${data.main.temp} °C
🌡️ Ощущается как ${data.main.feels_like} °C, Максимум ${data.main.temp_max} °C
🌊 Влажность: ${data.main.humidity} %
🌫️ Скорость ветра: ${data.wind.speed} м/с`;
};

interface OpenWeatherI {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface Coord {
  lon: number;
  lat: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Clouds {
  all: number;
}

interface Sys {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}
