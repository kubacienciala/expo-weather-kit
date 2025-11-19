import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoWeatherKitViewProps } from './ExpoWeatherKit.types';

const NativeView: React.ComponentType<ExpoWeatherKitViewProps> =
  requireNativeView('ExpoWeatherKit');

export default function ExpoWeatherKitView(props: ExpoWeatherKitViewProps) {
  return <NativeView {...props} />;
}
