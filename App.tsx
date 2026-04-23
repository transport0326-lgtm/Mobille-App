import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppTheme } from './src/theme/theme';
import store from './src/redux/store';
// import { getFCMToken, registerForegroundListener } from './src/utils/fcm';
import { getFCMToken } from './src/utils/fcm';

const App: React.FC = () => {
  useEffect(() => {
    // Get token on mount — log it so you can copy it for testing
    getFCMToken();

    // Listen for messages while the app is in the foreground
    // const unsubscribe = registerForegroundListener();
    // return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={AppTheme}>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
