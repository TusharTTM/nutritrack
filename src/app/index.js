import React from 'react';
import { Platform } from 'react-native';
import LandingScreen from '../screens/LandingScreen';
import AppRoute from './app';

// "/" is the marketing landing page on web; native builds go straight into the
// tracker. Both targets share one route file so there is a single entry point.
export default function IndexRoute() {
  return Platform.OS === 'web' ? <LandingScreen /> : <AppRoute />;
}
