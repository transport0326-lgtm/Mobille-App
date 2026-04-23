/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setBackgroundMessageHandler } from './src/utils/fcm';

// Must be called before AppRegistry so Firebase can handle background messages
setBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
