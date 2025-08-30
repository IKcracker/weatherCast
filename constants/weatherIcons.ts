
import { Cloud, CloudCogIcon, MoonStar, MoonStarIcon, Rainbow, Snowflake, SunIcon, Wind, CloudRain, CloudLightning, CloudDrizzle, CloudSnow, CloudFog, Tornado, CloudSun, CloudMoon } from "lucide-react-native";

// OpenWeatherMap icon code mapping
// https://openweathermap.org/weather-conditions
export const weatherIcons = {
    // Clear sky
    "01d": SunIcon, // day
    "01n": MoonStarIcon, // night

    // Few clouds
    "02d": CloudSun, // day
    "02n": CloudMoon, // night

    // Scattered clouds
    "03d": Cloud, // day
    "03n": Cloud, // night

    // Broken/overcast clouds
    "04d": CloudCogIcon, // day
    "04n": CloudCogIcon, // night

    // Shower rain
    "09d": CloudDrizzle, // day
    "09n": CloudDrizzle, // night

    // Rain
    "10d": CloudRain, // day
    "10n": CloudRain, // night

    // Thunderstorm
    "11d": CloudLightning, // day
    "11n": CloudLightning, // night

    // Snow
    "13d": CloudSnow, // day
    "13n": CloudSnow, // night

    // Mist, smoke, haze, dust, fog, sand, ash, squall
    "50d": CloudFog, // day
    "50n": CloudFog, // night

    // Tornado (not in icon set, but for completeness)
    "tornado": Tornado,
};