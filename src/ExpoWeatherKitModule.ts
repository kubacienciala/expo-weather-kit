import { NativeModule, requireNativeModule } from 'expo';

import {
  CurrentWeather,
  ExpoWeatherKitModuleEvents,
  WeatherAttribution,
  WeatherOptions,
  WeatherQueryResult,
} from './ExpoWeatherKit.types';

declare class ExpoWeatherKitModule extends NativeModule<ExpoWeatherKitModuleEvents> {
  getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<CurrentWeather>;

  getWeatherQuery(options: WeatherOptions): Promise<WeatherQueryResult>;

  /**
   * Get weather data attribution information.
   * This is required for apps that display weather data from Apple.
   */
  getWeatherAttribution(): Promise<WeatherAttribution>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoWeatherKitModule>('ExpoWeatherKit');
