import axios from "axios";

export const getWeather = async (latitude: number, longitude: number) => {
    
    const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`);
    return weather.data;
    
}

export const getForecast = async (latitude: number, longitude: number) => {
    const forecast = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`);
    return forecast.data;
}