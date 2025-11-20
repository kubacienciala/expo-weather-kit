import { NativeModule, requireNativeModule } from 'expo';

import {
  CurrentWeather,
  ExpoWeatherKitModuleEvents,
  WeatherOptions,
  WeatherQueryResult,
} from './ExpoWeatherKit.types';

declare class ExpoWeatherKitModule extends NativeModule<ExpoWeatherKitModuleEvents> {
  getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<CurrentWeather>;

  getWeatherQuery(options: WeatherOptions): Promise<WeatherQueryResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoWeatherKitModule>('ExpoWeatherKit');
