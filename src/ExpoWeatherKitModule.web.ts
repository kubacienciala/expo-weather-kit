import { registerWebModule, NativeModule } from 'expo';

import { ExpoWeatherKitModuleEvents } from './ExpoWeatherKit.types';

class ExpoWeatherKitModule extends NativeModule<ExpoWeatherKitModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoWeatherKitModule, 'ExpoWeatherKitModule');
