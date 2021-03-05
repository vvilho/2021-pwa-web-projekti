import {fetchGetJson} from "./network";
//const dailyUrl = `https://users.metropolia.fi/~ailip/messages.json`;
const dailyUrl = `assets/messages.json`;
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
export default MetropoliaMessages;
