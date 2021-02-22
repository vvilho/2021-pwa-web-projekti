import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import {setModalControls} from './modules/modal';
import './styles/style.scss';
import './styles/mobile.scss';
import './styles/widescreen.scss';
import HSLData from './modules/hsl-data';
import LanguageData from './data/language.json';
import CampusData from './data/campuses.json';
import WeatherData from './modules/weather-data';

const today = new Date().toISOString().split('T')[0];
let languageSetting = 'fi';
let campus = document.querySelector('#campuses').value;


// TODO: Load from local storage if exists or use default:
const userSettings = {
  colorTheme: 'dark',
  //move lang setting here
};

// TODO: updateUserSettings function
// - refresh page (e.g. use DOM manipulation to change class names)
// - save settings object to local storage

/**
 * All classes of those DOM object that has text that has to cahnge
 * When language setting is changed
 *
 * @type {string} name of class
 */
const languagDomClasses = [
  "appLangClassHome",
  "appLangClassMenu",
  "appLangClassRoutes",
  "appLangClassContacts",
  "appLangClassAppname",
  "appLangClassAppnamemobile",
  "appLangClassSlogan",
  "appLangClassMaintext",
  "appLangClassHslroute"
];


const restaurants = [{
  displayName: 'Myyrmäen Sodexo',
  name: 'sodexo-myyrmaki',
  id: 152,
  type: SodexoData
}, {
  displayName: 'Karaportin Fasu',
  name: 'fazer-kp',
  id: 270540,
  type: FazerData
}];

// adding a restaurant
// restaurants.push(
//   {
//     displayName: 'Arabian Sodexo',
//     name: 'sodexo-arabia',
//     id: 999,
//     type: SodexoData
//   }
// );

/**
 * Displays lunch menu items as html list
 *
 * @param {Array} menuData - Lunch menu array
 * @param {string} restaurant - element target id
 */
const renderMenu = (menuData, restaurant) => {
  const restaurantDiv = document.querySelector('#' + restaurant);
  restaurantDiv.innerHTML = '';
  const ul = document.createElement('ul');
  for (const item of menuData) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  restaurantDiv.appendChild(ul);
};

/**
 * Displays a notification message instead of dishes
 * when menu data is not available
 *
 * @param {string} message
 * @param {string} restaurant
 */
const renderNoDataNotification = (message, restaurant) => {
  const restaurantDiv = document.querySelector('#' + restaurant);
  restaurantDiv.innerHTML = `<p>${message}</p>`;
};

const createUiLanguages = (language) => {
  try {
    for (const dom of languagDomClasses){
      let domName = dom.slice(12).toLowerCase();
      document.querySelector("." + dom).textContent = LanguageData[domName][language];
    }
  }catch(e){
    console.log("Error in createUiLanguages: ", e);
  }
};


/**
 * Switches application language between en/fi
 * and updates menu data
 */

const switchLanguage = () => {
  if (languageSetting === 'fi') {
    languageSetting = 'en';
    createUiLanguages(languageSetting);
  } else {
    languageSetting = 'fi';
    createUiLanguages(languageSetting);
  }
  console.log('language changed to: ', languageSetting);
  loadAllMenuData();
};

/**
 * Load data for all restaurant boxes
 * @async
 */
const loadAllMenuData = async () => {
  for (const restaurant of restaurants) {
    try {
      const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, languageSetting, today);
      renderMenu(parsedMenu, restaurant.name);
    } catch (error) {
      console.error(error);
      // notify user if errors with data
      renderNoDataNotification('No data available..', restaurant.name);
    }
  }
};


const loadHSLData = async (stopid) => {
  console.log(Object.keys(stopid).length);
  document.querySelector('.hsl-data').textContent = "";
  const stopElement = document.createElement('div');
  for(const i of stopid){
    console.log(Object.values(i));

    const result = await HSLData.getRidesByStopId(Object.values(i));
    const stop = result.data.stop;
    console.log('loadHSLData', stop);


    stopElement.innerHTML += `<br><h3>Seuraavat vuorot pysäkiltä ${stop.name}</h3>`;
    const ulElement = document.createElement('ul');

    for (const ride of stop.stoptimesWithoutPatterns) {
      ulElement.innerHTML += `<li>${ride.trip.routeShortName},
      ${ride.trip.tripHeadsign},
      ${HSLData.formatTime(ride.scheduledDeparture)}</li>`;
    }
    stopElement.appendChild(ulElement);
    document.querySelector('.hsl-data').appendChild(stopElement);
  }


};

const hslForEachCampus = () => {
  campus = document.querySelector('#campuses').value;
  loadHSLData(CampusData[campus]["hslstopid"]);
};

/**
 * Displays Weather data from openweathermap.org API
 *
 * @param {String} campus
 * @param {String} language
 */
const loadWeatherData = async (campus, language) => {
  let name = document.querySelector('.name');
  let weatherIcon = document.querySelector('.weather-icon');
  let desc = document.querySelector('.desc');
  let temp = document.querySelector('.temp');

  const result = await WeatherData.getWeatherData(campus, language);
  console.log('loadWeatherData', result);
    let nameValue = result.name;
    let weatherIconValue = result.weather[0].icon;
    let tempValue = result.main.temp;
    let descValue = result.weather[0].description;

    name.innerHTML = nameValue;
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherIconValue}.png">`;
    temp.innerHTML = tempValue + ' C';
    desc.innerHTML = descValue;
};


/**
 * Registers the service worker (SW) generated by Workbox
 */
const registerServiceWorkers = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
};

/**
 * App initialization
 */
const init = () => {
  console.log(document.querySelector('#campuses').value);
  document.querySelector('#switch-lang').addEventListener('click', switchLanguage);
  document.querySelector('#campuses').addEventListener('change', hslForEachCampus);
  loadAllMenuData();
  loadHSLData(CampusData[campus]["hslstopid"]);
  setModalControls();
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  // Service workers registeration below disabled temporarily for easier local development
  // must be uncommented from init() before building for "production"
  //registerServiceWorkers();
};
init();


