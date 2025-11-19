import * as React from 'react';

import { ExpoWeatherKitViewProps } from './ExpoWeatherKit.types';

export default function ExpoWeatherKitView(props: ExpoWeatherKitViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
