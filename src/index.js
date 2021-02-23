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


/**
 * All classes of those DOM object that has text that has to cahnge
 * When language setting is changed
 *
 * @type {string[]} list of classnames
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


/**
 * Displays lunch menu items as html list
 *
 * @param {Array} menuData - Lunch menu array
 */
const renderMenu = (menuData) => {
  const restaurantDiv = document.querySelector('#fazer-kp');
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
 * @param {string} message -Error message
 */
const renderNoDataNotification = (message) => {
  const restaurantDiv = document.querySelector('#fazer-kp');
  restaurantDiv.innerHTML = `<p>${message}</p>`;
};


/**
 * Changes every elements text that has to change during language change
 *
 * @param {string} language -language shortname ("fi"/"en")
 */
const createUiLanguages = (language) => {
  try {
    for (const dom of languagDomClasses) {
      let domName = dom.slice(12).toLowerCase();
      document.querySelector("." + dom).textContent = LanguageData[domName][language];
    }
  } catch (e) {
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
 * Loads menudata for current campus' restaurant
 *
 * @async
 */
const loadAllMenuData = async () => {
  try {
    let parsedMenu;
    document.querySelector('.res-heading').textContent = CampusData[campus]["restaurantname"];
    if (CampusData[campus]["restauranttype"] === "FazerData") {
      parsedMenu = await FazerData.getDailyMenu(CampusData[campus]["foodmenuid"], languageSetting, today);
    } else {
      parsedMenu = await SodexoData.getDailyMenu(CampusData[campus]["foodmenuid"], languageSetting, today);
    }
    ;

    renderMenu(parsedMenu, CampusData[campus]["displayname"]);
  } catch (error) {
    console.error(error);
    // notify user if errors with data
    renderNoDataNotification('No data available..', CampusData[campus]["displayname"]);
  }
};

/**
 *
 * @param {number} id -Transportation vehicle id
 * @returns {string} -Icon/image of vehicle
 */
const transportationVehicleIcon = (id) => {
  if (id == 0) {
    return `<img src="./assets/icons/tram.svg">`;
  } else if (id == 1) {
    return `<img src="./assets/icons/subway.svg">`;
  } else if (id == 109) {
    return `<img src="./assets/icons/train.svg">`;
  } else if (id == 3) {
    return `<img src="./assets/icons/bus.svg">`;
  }
};

/**
 *
 * @param {number} stopid -Id for current bus stop etc.
 * @async
 */
const loadHSLData = async (stopid) => {
try{
  let list = [];
  for (const i of stopid) {

    const result = await HSLData.getRidesByStopId(i["id"]);
    const stop = result.data.stop;

    for (const ride of stop.stoptimesWithoutPatterns) {
      list.push({
        data: transportationVehicleIcon(stop.vehicleType) + ` ${ride.trip.routeShortName},  ${ride.trip.tripHeadsign}, ${HSLData.formatTime(ride.scheduledDeparture)}`,
        timestamp: ride.scheduledDeparture
      });
    }

  }
  list.sort((a, b) => {
    return (a.timestamp) - (b.timestamp);
  });

  renderHSLData(list);
}catch (error) {
  renderHSLData([]);
  console.log(error);
}



};
/**
 * Render HSL transportation data on website
 *
 *
 * @param {array} list - List of coming HSL transportation
 */
const renderHSLData = async (list) => {

  const stopElement = document.createElement('div');
  const ulElement = document.createElement('ul');

  for (const ride of await list.slice(0,6)){
    const liElement = document.createElement('li');
    liElement.innerHTML = ride.data;
    ulElement.appendChild(liElement);
  }

  document.querySelector('.hsl-data').textContent = "";

  if(list.length == 0){
    document.querySelector('.hsl-data').textContent = "HSL data can not be loaded";
    return;
  }
  stopElement.appendChild(ulElement);
  document.querySelector('.hsl-data').appendChild(stopElement);

};

const forEachCampus = () => {
  campus = document.querySelector('#campuses').value;
  loadHSLData(CampusData[campus]["hslstopid"]);
  localStorage.setItem('Campus', campus);
  loadAllMenuData();
};

const campusInit = () => {
  if (localStorage.getItem('Campus') == null) {
    localStorage.setItem('Campus', campus);
  }
  campus = localStorage.getItem('Campus');
  document.querySelector('#campuses option[value="' + campus + '"]').selected = true;
  loadAllMenuData();
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

  campusInit();
  document.querySelector('#switch-lang').addEventListener('click', switchLanguage);
  document.querySelector('#campuses').addEventListener('change', forEachCampus);

  setModalControls();

  loadWeatherData(CampusData[campus]["location"], languageSetting);

  // Service workers registeration below disabled temporarily for easier local development
  // must be uncommented from init() before building for "production"
  //registerServiceWorkers();
};
init();


