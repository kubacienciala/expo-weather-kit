import { NativeModule, requireNativeModule } from 'expo';

import { ExpoWeatherKitModuleEvents } from './ExpoWeatherKit.types';

declare class ExpoWeatherKitModule extends NativeModule<ExpoWeatherKitModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoWeatherKitModule>('ExpoWeatherKit');
