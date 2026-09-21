// Detects today's weather from the browser's geolocation via Open-Meteo —
// a free API that needs no key, so this stays a pure client-side call with
// no backend involved. Maps the result to one of our own weather activity
// names so it can be logged the same way as any other tap-to-log activity.
import { WEATHER_ACTIVITY_NAMES } from "./activityIcons";

function mapWeatherCodeToActivity(code: number, windSpeedKmh: number): string {
  if (windSpeedKmh >= 45) return "Stürmisch";
  if (windSpeedKmh >= 25) return "Windig";
  if (code === 0 || code === 1) return "Sonnig";
  if (code === 2 || code === 3) return "Bewölkt";
  if (code === 45 || code === 48) return "Nebel";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Regnerisch";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Schnee";
  if (code === 95 || code === 96 || code === 99) return "Stürmisch";
  return "Bewölkt";
}

export async function detectCurrentWeatherActivity(): Promise<string> {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation wird von diesem Browser nicht unterstützt."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });

  const { latitude, longitude } = position.coords;
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
  );
  if (!response.ok) throw new Error("Wetterdaten konnten nicht geladen werden.");
  const data = (await response.json()) as { current_weather?: { weathercode: number; windspeed: number } };
  if (!data.current_weather) throw new Error("Keine Wetterdaten erhalten.");

  const activityName = mapWeatherCodeToActivity(data.current_weather.weathercode, data.current_weather.windspeed);
  return WEATHER_ACTIVITY_NAMES.includes(activityName) ? activityName : "Bewölkt";
}
