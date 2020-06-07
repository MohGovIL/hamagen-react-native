import BackgroundFetch from "react-native-background-fetch";
import { startLocationTracking } from "./services/LocationService";
import { initLocalHeadless } from "./actions/LocaleActions";

const bgMessaging = async () => {
  console.log('data message received');
  try{

    await BackgroundFetch.stop();
    await BackgroundFetch.start();

    const { locale, notificationData } = await initLocalHeadless()
    await startLocationTracking(locale,notificationData )

  } catch(error){
    console.log(error);
    
  }
};

export default bgMessaging