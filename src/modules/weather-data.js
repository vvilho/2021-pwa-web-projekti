import {fetchGetJson} from "./network";

/**
 * gets data from openweathermap.org API
 *
 * @param {String} cityName
 * @param {String} languageSetting
 */
const getWeatherData = async (cityName, languageSetting) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=${languageSetting}&appid=16a2e2cc03a7c5f22d63a1d93f6bbc92`;
  return await fetchGetJson(apiUrl);
};

const WeatherData = {getWeatherData};
export default WeatherData;
