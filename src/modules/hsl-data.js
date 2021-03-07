import {fetchPostJson} from "./network";

const apiUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';


/**
 * Sends POST query in digitransit API to get tarnsportation informaation
 *
 * @param {number} id -Bus stop id
 * @return {JSON} list of trips from current stop
 */
const getRidesByStopId = async (id) => {

  const query = `{
    stop(id: "HSL:${id}") {
      name
      vehicleType
      stoptimesWithoutPatterns {
        scheduledArrival
        realtimeArrival
        arrivalDelay
        scheduledDeparture
        realtimeDeparture
        departureDelay
        realtime
        realtimeState
        serviceDay
        headsign
        trip {
          routeShortName
          tripHeadsign
        }
      }
    }
  }`;

  const data = await fetchPostJson(apiUrl, 'application/graphql', query);

  setTimeout(() => {
    if (data == null){
       throw new Error("Loading timeout");
       return;
    }
  },5000);
  return data;


};

/**
 * Converts HSL time to more readable format
 *
 * @param {number} seconds - since midnight
 * @returns {string} HH:MM
 */
const formatTime = (seconds) => {
  let hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) - (hours * 60);

  if(hours > 24){
    hours -= 24;
  }
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

const HSLData = {getRidesByStopId, formatTime};
export default HSLData;
