import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import {setModalControls} from './modules/modal';
import './styles/style.scss';
import './styles/mobile.scss';
import './styles/widescreen.scss';
import scssVariables from './styles/_variables.scss';
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
    listItem.innerHTML = item;
    ul.appendChild(listItem);
  }

  restaurantDiv.appendChild(ul);
  //Add diet code properties after the menu
  restaurantDiv.innerHTML +=
    languageSetting == "fi"?
      `<br><br>(G) Gluteeniton, (L) Laktoositon, (VL) Vähälaktoosinen, (M) Maidoton, (*) Voi hyvin,
        (Veg) Soveltuu vegaaniruokavalioon, (VS) Sis. tuoretta valkosipulia, (A) Sis. allergeeneja`
      :
      `<br><br>(G) Gluten free, (L) Lactose free, (VL) Low lactose, (M) Milk-free, (*) Wellbeing,
        (Veg) Suitable for vegans, (VS) Contains fresh garlic, (A) Contains allergens`;
};

/**
 * Displays a notification message instead of dishes
 * when menu data is not available
 *
 * @param {string} message -Error message
 */
const renderNoMenuDataNotification = (message) => {
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
    renderNoMenuDataNotification('No data available..', CampusData[campus]["displayname"]);
  }
};

/**
 *
 * @param {number} id -Transportation vehicle id
 * @returns {string} -Icon/image of vehicle
 */
const transportationVehicleIcon = (id) => {
  let vehicle;
  if (id == 0) {
    vehicle = "tram";
  } else if (id == 1) {
    vehicle = "subway";
  } else if (id == 109) {
    vehicle = "train";
  } else if (id == 3) {
    vehicle = "bus";
  }
  return `<img src="./assets/icons/${vehicle}.svg">`;

};

/**
 *
 * @param {number} stopid -Id for current bus stop etc.
 * @async
 */
const loadHSLData = async (stopid) => {
  try {
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
  } catch (error) {
    renderHSLData([]);
    console.log(error);
  }


};

const changeBackgroundImage = () => {
  document.querySelector('#showcase-imgarea').style["background"] = "url('./assets/img/"+campus+"-kampus-big.jpg') no-repeat center center/cover";
  document.querySelector('.info-area').style["background"] = "url('./assets/img/"+campus+"-kampus-big.jpg') no-repeat center center/cover";

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

  for (const ride of await list.slice(0, 6)) {
    const liElement = document.createElement('li');
    liElement.innerHTML = ride.data;
    ulElement.appendChild(liElement);
  }

  document.querySelector('.hsl-data').textContent = "";

  if (list.length == 0) {
    document.querySelector('.hsl-data').textContent = "HSL data can not be loaded";
    return;
  }
  stopElement.appendChild(ulElement);
  document.querySelector('.hsl-data').appendChild(stopElement);

};


/**
 * After campus is changed from select menu
 * HSL, weather and restaurant menu are updated
 * and new campus is saved to local storage
 */
const forEachCampus = () => {
  campus = document.querySelector('#campuses').value;
  loadHSLData(CampusData[campus]["hslstopid"]);
  localStorage.setItem('Campus', campus);
  loadAllMenuData();
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  changeBackgroundImage();

};


/**
 * Runs when app is first onened
 *
 */
const campusInit = () => {
  if (localStorage.getItem('Campus') == null) {
    localStorage.setItem('Campus', campus);
  }
  campus = localStorage.getItem('Campus');
  document.querySelector('#campuses option[value="' + campus + '"]').selected = true;
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  loadAllMenuData();
  loadHSLData(CampusData[campus]["hslstopid"]);
  // document.querySelector('#showcase-imgarea').style.background = "";
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
  let nameValue = result.name;
  let weatherIconValue = result.weather[0].icon;
  let tempValue = result.main.temp;
  let descValue = result.weather[0].description;

  name.innerHTML = nameValue;
  weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherIconValue}.png">`;
  temp.innerHTML = `${tempValue.toFixed(1)} &deg;C`;
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


  // Service workers registeration below disabled temporarily for easier local development
  // must be uncommented from init() before building for "production"
  //registerServiceWorkers();
};
init();


