import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import AuthProvider from './src/components/AuthProvider';

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
            <StatusBar style="auto" />
          </QueryClientProvider>
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
