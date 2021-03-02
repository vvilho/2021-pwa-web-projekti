import MetropoliaMessages from "../data/messages.json";
console.log("messages", MetropoliaMessages);

let messagesEn = [];
let messagesFi = [];

/**
 * Parses couse arrays from Sodexo json file
 *
 * @param {Object} messageDataJson
 */
const parseMetropoliaMessages = (messageDataJson) => {
  const messages = Object.values(messageDataJson);
  for (const message of messages) {
    messagesEn.push(message.en);
    messagesFi.push(message.fi);
  }
};

parseMetropoliaMessages(MetropoliaMessages.message);

const MessageData = {messagesEn, messagesFi};
console.log('Metropolia messages parsed json file', MessageData);

export default MessageData;

/*import {fetchGetJson} from "./network";

const dailyUrl = `http://users.metropolia.fi/~ailip/messages.json`;

const parseMetropoliaMessages = (messageDataJson) => {
  const messagesEn = [];
  const messagesFi = [];
  const messages = Object.values(messageDataJson);
  for (const message of messages) {
    messagesEn.push(message.en);
    messagesFi.push(message.fi);
  }
  return {fi: messagesFi, en: messagesEn};
};

const getMessages = async (lang) => {
  let messageData;
  try {
    messageData = await fetchGetJson(dailyUrl);
  } catch (error) {
    throw new Error(error.message);
  }
  const parsedMessages = parseMetropoliaMessages(messageData.message);
  return (lang === 'fi') ? parsedMessages.fi : parsedMessages.en;
};

console.log(getMessages('fi'));

const MetropoliaMessages = {getMessages};
export default MetropoliaMessages;*/
