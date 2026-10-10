import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {},
  hi: {
    Overview: 'परिचय', Live: 'लाइव', Intelligence: 'विश्लेषण', 'Ask HeatSense': 'HeatSense से पूछें', System: 'सिस्टम',
    'Cooler rooms.': 'ठंडे कमरे।', 'Safer people.': 'सुरक्षित लोग।', 'Smarter cities.': 'स्मार्ट शहर।',
    'Explore the system': 'सिस्टम जानें', 'View live dashboard': 'लाइव डैशबोर्ड देखें',
    'Your room. In real time.': 'आपका कमरा। वास्तविक समय में।', 'Room occupancy': 'कमरे में उपस्थिति', 'Active persona': 'सक्रिय प्रोफ़ाइल', 'Device bridge': 'डिवाइस ब्रिज', 'Current risk': 'वर्तमान जोखिम',
    'Room intelligence': 'कमरे का विश्लेषण', Temperature: 'तापमान', Humidity: 'आर्द्रता', 'Heat index': 'हीट इंडेक्स', 'Risk history': 'जोखिम इतिहास',
    General: 'सामान्य', Worker: 'कर्मचारी', Elderly: 'बुज़ुर्ग', Child: 'बच्चा',
    SAFE: 'सुरक्षित', MEDIUM: 'मध्यम', HIGH: 'उच्च', EXTREME: 'अत्यधिक', OCCUPIED: 'उपस्थित', EMPTY: 'खाली', CONNECTED: 'जुड़ा हुआ', DISCONNECTED: 'डिस्कनेक्ट',
    GENERAL: 'सामान्य', WORKER: 'कर्मचारी', ELDERLY: 'बुज़ुर्ग', CHILD: 'बच्चा',
    'Sensor integrating': 'सेंसर एकीकरण जारी', 'Awaiting sensor data': 'सेंसर डेटा की प्रतीक्षा', 'Awaiting device': 'डिवाइस की प्रतीक्षा', 'Choose a perspective': 'एक प्रोफ़ाइल देखें',
    'Preview only · use the device button to change the active persona.': 'केवल पूर्वावलोकन · सक्रिय प्रोफ़ाइल बदलने के लिए डिवाइस का बटन दबाएँ।',
    'System health': 'सिस्टम स्थिति', 'Backend unavailable': 'बैकएंड उपलब्ध नहीं', 'Connecting to backend': 'बैकएंड से जुड़ रहे हैं', 'Live connection': 'लाइव कनेक्शन', 'API error': 'API त्रुटि', 'Retry connection': 'फिर प्रयास करें',
    'Assistant in development': 'सहायक का विकास जारी', 'Ask about the current room conditions…': 'कमरे की वर्तमान स्थिति के बारे में पूछें…', 'Send message': 'संदेश भेजें',
    'Why is the risk high?': 'जोखिम अधिक क्यों है?', 'Is this room safe for an elderly person?': 'क्या यह कमरा बुज़ुर्ग व्यक्ति के लिए सुरक्षित है?', 'Should I take a cooling break?': 'क्या मुझे ठंडक के लिए विराम लेना चाहिए?', 'Why did the fan turn on?': 'पंखा क्यों चालू हुआ?', 'What could the room be like in one hour?': 'एक घंटे बाद कमरा कैसा हो सकता है?',
    'Waiting for hardware': 'हार्डवेयर की प्रतीक्षा', 'Hardware connected': 'हार्डवेयर जुड़ा है', 'Radiant temperature': 'विकिरण तापमान', 'Light intensity': 'प्रकाश तीव्रता', Activity: 'गतिविधि', 'Fan status': 'पंखे की स्थिति', Planned: 'नियोजित', Integrating: 'एकीकरण जारी', Prototype: 'प्रोटोटाइप', 'Local time': 'स्थानीय समय',
  },
  od: {
    Overview: 'ପରିଚୟ', Live: 'ଲାଇଭ୍', Intelligence: 'ବିଶ୍ଳେଷଣ', 'Ask HeatSense': 'HeatSense କୁ ପଚାରନ୍ତୁ', System: 'ସିଷ୍ଟମ୍',
    'Cooler rooms.': 'ଶୀତଳ କୋଠରୀ।', 'Safer people.': 'ସୁରକ୍ଷିତ ଲୋକ।', 'Smarter cities.': 'ସ୍ମାର୍ଟ ସହର।',
    'Explore the system': 'ସିଷ୍ଟମ୍ ଜାଣନ୍ତୁ', 'View live dashboard': 'ଲାଇଭ୍ ଡ୍ୟାସବୋର୍ଡ ଦେଖନ୍ତୁ',
    'Your room. In real time.': 'ଆପଣଙ୍କ କୋଠରୀ। ବାସ୍ତବ ସମୟରେ।', 'Room occupancy': 'କୋଠରୀରେ ଉପସ୍ଥିତି', 'Active persona': 'ସକ୍ରିୟ ପ୍ରୋଫାଇଲ୍', 'Device bridge': 'ଡିଭାଇସ୍ ବ୍ରିଜ୍', 'Current risk': 'ବର୍ତ୍ତମାନର ବିପଦ',
    'Room intelligence': 'କୋଠରୀ ବିଶ୍ଳେଷଣ', Temperature: 'ତାପମାତ୍ରା', Humidity: 'ଆର୍ଦ୍ରତା', 'Heat index': 'ତାପ ସୂଚକାଙ୍କ', 'Risk history': 'ବିପଦ ଇତିହାସ',
    General: 'ସାଧାରଣ', Worker: 'ଶ୍ରମିକ', Elderly: 'ବୟସ୍କ', Child: 'ଶିଶୁ', GENERAL: 'ସାଧାରଣ', WORKER: 'ଶ୍ରମିକ', ELDERLY: 'ବୟସ୍କ', CHILD: 'ଶିଶୁ',
    SAFE: 'ସୁରକ୍ଷିତ', MEDIUM: 'ମଧ୍ୟମ', HIGH: 'ଉଚ୍ଚ', EXTREME: 'ଅତ୍ୟଧିକ', OCCUPIED: 'ଉପସ୍ଥିତ', EMPTY: 'ଖାଲି', CONNECTED: 'ସଂଯୁକ୍ତ', DISCONNECTED: 'ବିଚ୍ଛିନ୍ନ',
    'Sensor integrating': 'ସେନ୍ସର୍ ସଂଯୋଗ ଚାଲିଛି', 'Awaiting sensor data': 'ସେନ୍ସର୍ ତଥ୍ୟ ଅପେକ୍ଷାରେ', 'Awaiting device': 'ଡିଭାଇସ୍ ଅପେକ୍ଷାରେ', 'Choose a perspective': 'ଏକ ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ',
    'Preview only · use the device button to change the active persona.': 'କେବଳ ପୂର୍ବାବଲୋକନ · ସକ୍ରିୟ ପ୍ରୋଫାଇଲ୍ ପାଇଁ ଡିଭାଇସ୍ ବଟନ୍ ଦବାନ୍ତୁ।',
    'System health': 'ସିଷ୍ଟମ୍ ସ୍ଥିତି', 'Backend unavailable': 'ବ୍ୟାକଏଣ୍ଡ ଉପଲବ୍ଧ ନାହିଁ', 'Connecting to backend': 'ବ୍ୟାକଏଣ୍ଡ ସହ ଯୋଡ଼ୁଛି', 'Live connection': 'ଲାଇଭ୍ ସଂଯୋଗ', 'API error': 'API ତ୍ରୁଟି', 'Retry connection': 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ',
    'Assistant in development': 'ସହାୟକ ବିକାଶ ଚାଲିଛି', 'Ask about the current room conditions…': 'କୋଠରୀର ବର୍ତ୍ତମାନ ସ୍ଥିତି ବିଷୟରେ ପଚାରନ୍ତୁ…', 'Send message': 'ବାର୍ତ୍ତା ପଠାନ୍ତୁ',
    'Why is the risk high?': 'ବିପଦ ଅଧିକ କାହିଁକି?', 'Is this room safe for an elderly person?': 'ଏହି କୋଠରୀ ବୟସ୍କଙ୍କ ପାଇଁ ସୁରକ୍ଷିତ କି?', 'Should I take a cooling break?': 'ମୁଁ ଥଣ୍ଡା ହେବା ପାଇଁ ବିରତି ନେବି କି?', 'Why did the fan turn on?': 'ପଙ୍ଖା କାହିଁକି ଚାଲିଲା?', 'What could the room be like in one hour?': 'ଏକ ଘଣ୍ଟା ପରେ କୋଠରୀ କିପରି ହୋଇପାରେ?',
    'Waiting for hardware': 'ହାର୍ଡୱେର୍ ଅପେକ୍ଷାରେ', 'Hardware connected': 'ହାର୍ଡୱେର୍ ସଂଯୁକ୍ତ', 'Radiant temperature': 'ବିକିରଣ ତାପମାତ୍ରା', 'Light intensity': 'ଆଲୋକ ତୀବ୍ରତା', Activity: 'କାର୍ଯ୍ୟକଳାପ', 'Fan status': 'ପଙ୍ଖା ସ୍ଥିତି', Planned: 'ଯୋଜନାରେ', Integrating: 'ସଂଯୋଗ ଚାଲିଛି', Prototype: 'ପ୍ରୋଟୋଟାଇପ୍', 'Local time': 'ସ୍ଥାନୀୟ ସମୟ',
  },
};
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => { try { return ['en', 'hi', 'od'].includes(sessionStorage.getItem('heatsense-language')) ? sessionStorage.getItem('heatsense-language') : 'en'; } catch { return 'en'; } });
  useEffect(() => { document.documentElement.lang = language === 'od' ? 'or' : language; try { sessionStorage.setItem('heatsense-language', language); } catch { /* Storage may be disabled. */ } }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t: text => translations[language][text] || text }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
