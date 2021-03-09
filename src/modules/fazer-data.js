/**
 * Functions for managing Fazer menu data
 * @module modules/fazer-data
 * @author Ailip <ailip@metropolia.fi>
 * @author vilhov <vilhov@metropolia.fi>
 *
 */
import {fazerProxyUrl} from "../settings";
import {fetchGetJson} from "./network";


const weeklyUrlEn = `${fazerProxyUrl}/api/restaurant/menu/week?language=en&restaurantPageId=270540&weekDate=`;
const weeklyUrlFi = `${fazerProxyUrl}/api/restaurant/menu/week?language=fi&restaurantPageId=270540&weekDate=`;

/**
 * Returns a daily menu array from Fazer weekly json data
 * @param {Object} menuData
 * @param {Number} dayOfWeek week day 0-6
 * @returns {Array} daily menu
 */
const parseDailyMenu = (menuData, dayOfWeek) => {
  //Check if list is empty -> Then restaurant is closed.
  if (menuData.LunchMenus[dayOfWeek].SetMenus.length == 0) {
    throw new Error;
    console.log(Error);
  }
  let dailyMenu = menuData.LunchMenus[dayOfWeek].SetMenus.map(setMenu => {
    // console.log(setMenu);

    let mealName = setMenu.Name;
    let dishes = setMenu.Meals.map(dish => {
      return `${dish.Name} (${dish.Diets.join(', ')})`;
    });
    return mealName ? `${mealName}: ${dishes.join(', ')} <p><b>1,90€ / 2,70€ / 5,71€</b></p>` : `${dishes.join(', ')} <p><b>1,90€ / 2,70€ / 5,71€</b></p>`;
  });
  return dailyMenu;
};

/**
 * Get daily menu from Fazer API
 *
 * @async
 * @param {string} lang
 * @param {string} date in ISO format (YYYY-MM-DD)
 * @return {Promise<Array>} Daily menu data
 */
const getDailyMenu = async (restaurantId, lang, date) => {
  // Get number of the weekday (0: Sun, 1: Mon, etc.)

  let dayOfWeek = new Date().getDay();
  // Fazer's index for Monday is 0, in JS it is 1
  dayOfWeek -= 1;
  if (dayOfWeek === -1) {
    dayOfWeek = 6;
  }
  let menuData;
  try {
    menuData = await fetchGetJson(`${lang == 'fi' ? weeklyUrlFi : weeklyUrlEn}2020-02-07`);
  } catch (error) {
    throw new Error(error.message);
    console.log('FazerMenu load error: ' + error);
  }
  return parseDailyMenu(menuData, dayOfWeek);
};

const FazerData = {getDailyMenu};
export default FazerData;
