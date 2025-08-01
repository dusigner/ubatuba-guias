interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  date: string;
}

interface WeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export async function getWeatherForecast(date?: string): Promise<WeatherData | null> {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  
  if (!API_KEY) {
    console.log('⚠️ OpenWeather API key não configurada');
    return null;
  }

  try {
    // Coordenadas de Ubatuba, SP
    const lat = -23.4336;
    const lon = -45.0838;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Chave da API OpenWeather inválida ou inativa. Aguarde alguns minutos para ativação.');
      } else {
        console.error('❌ Erro na API do OpenWeather:', response.status);
      }
      return null;
    }

    const data: WeatherResponse = await response.json();
    
    // Se uma data específica foi fornecida, buscar a previsão mais próxima
    let targetForecast = data.list[0]; // Padrão: próxima previsão
    
    if (date) {
      const targetDate = new Date(date);
      const targetTimestamp = targetDate.getTime();
      
      // Encontrar a previsão mais próxima da data desejada
      targetForecast = data.list.reduce((closest, current) => {
        const currentTimestamp = current.dt * 1000;
        const closestTimestamp = closest.dt * 1000;
        
        return Math.abs(targetTimestamp - currentTimestamp) < Math.abs(targetTimestamp - closestTimestamp)
          ? current
          : closest;
      });
    }

    return {
      temperature: Math.round(targetForecast.main.temp),
      description: targetForecast.weather[0].description,
      icon: targetForecast.weather[0].icon,
      humidity: targetForecast.main.humidity,
      windSpeed: Math.round(targetForecast.wind.speed * 3.6), // Convert m/s to km/h
      date: targetForecast.dt_txt
    };

  } catch (error) {
    console.error('❌ Erro ao buscar previsão do tempo:', error);
    return null;
  }
}

export function getWeatherEmoji(icon: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  };
  
  return iconMap[icon] || '🌤️';
}