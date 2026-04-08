# expo-weather-kit

Modern Expo / React Native bindings for Apple WeatherKit. Retrieve current conditions, hourly & daily forecasts, minute‑level precipitation, alerts, availability metadata, and WeatherKit attribution through a single, typed API.

---

## Platform Support

| Platform                  | Status | Notes                                                                                       |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| iOS / iPadOS              | ✅     | Requires iOS 16+ and a paid Apple Developer account with the WeatherKit capability enabled. |
| macOS Catalyst            | ✅     | Same requirements as iOS.                                                                   |
| watchOS / tvOS / visionOS | ⚠️     | WeatherKit APIs are available, but this package has only been tested on iOS so far.         |
| Android / Web             | ⚠️     | Module exports throw descriptive errors (WeatherKit is an Apple service).                   |

---

## Requirements

- Expo SDK 50+ (or bare React Native ≥ 0.73) with the new architecture enabled.
- Xcode 15+ and CocoaPods 1.15+.
- Apple Developer Program membership.
- WeatherKit App Service toggled on for your Bundle ID in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list) (see instructions below).

---

## Configure Your Expo Project

Add / merge the following structure into `app.json` (or `app.config.js`). The indentation shows the full tree so it’s easy to copy into an existing config:

```jsonc
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.weatherkit": true,
      },
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "16.0",
          },
        },
      ],
    ],
  },
}
```

> **Why the entitlements & plugin?**
>
> - `com.apple.developer.weatherkit` tells Xcode to embed the WeatherKit entitlement in your provisioning profile.
> - `expo-build-properties` ensures EAS / `expo run:ios` compiles against iOS 16+ (the minimum for WeatherKit).

---

## Installation

```bash
npm install expo-weather-kit
# or
yarn add expo-weather-kit
```

After you merge the configuration above, regenerate the native projects and pods:

```bash
npx expo prebuild --clean   # managed Expo: rebuilds ios/ with new entitlements + plugins
npx pod-install             # in bare or after prebuild to sync CocoaPods
```

---

## Enable WeatherKit in Apple Developer Portal

1. Sign in to [Identifiers → App IDs](https://developer.apple.com/account/resources/identifiers/list).
2. Select the Bundle ID you configured above.
3. Scroll to **App Services** and tick **WeatherKit**. It should look like the screenshot below (blue checkmark next to WeatherKit).
4. Save the changes so the capability propagates to your provisioning profiles. (The “WeatherKit” row should show a blue checkmark in App Services.)

> If you’re using automatic signing, Xcode will refresh signing assets the next time you build. For EAS, run `eas device:configure` or regenerate credentials so the new entitlement is picked up.

---

## Usage

```ts
import ExpoWeatherKit from 'expo-weather-kit';

const { latitude, longitude } = { latitude: 37.779, longitude: -122.419 };

// Minimal: current conditions
const current = await ExpoWeatherKit.getCurrentWeather(latitude, longitude);
console.log(current.temperature, current.condition, current.conditionCode);

// Full control: fetch only the datasets you need
const result = await ExpoWeatherKit.getWeatherQuery({
  latitude,
  longitude,
  current: true,
  hourly: true,
  daily: true,
  minute: true,
  alerts: true,
  availability: true,
});

console.log(result.hourly?.[0]?.apparentTemperature);
console.log(result.alerts?.map((alert) => alert.summary));

// Get attribution (required for displaying weather data)
const attribution = await ExpoWeatherKit.getWeatherAttribution();
console.log('Service:', attribution.serviceName);
console.log('Legal Text:', attribution.legalAttributionText);
// Display the Apple Weather mark and link to legalPageURL
```

### `getCurrentWeather(lat, lon)`

Returns a lightweight snapshot:

```ts
type CurrentWeather = {
  temperature: number;
  temperatureUnit: string;
  condition: string; // localized display string from WeatherKit
  conditionCode?: string; // stable enum code, e.g. "Cloudy" or "HeavyRain"
  humidity: number; // 0–1
  windSpeed: number;
  windSpeedUnit: string;
  windDirection: number; // degrees
  pressure: number;
  pressureUnit: string;
  uvIndex: number;
  visibility: number;
  visibilityUnit: string;
  date: string; // ISO 8601
};
```

### `getWeatherQuery(options)`

Pass booleans to opt into each dataset (current, hourly, daily, minute, alerts, availability). Optional `hourlyRange` / `dailyRange` (Unix seconds) let you limit datasets for custom charts.

> **Range limits (Apple WeatherKit):**
>
> - Historical data is only available from **1 Aug 2021** onward.
> - Forecasts can extend at most **10 days into the future**.
> - Each request returns a maximum of **10 days**.
> - A calendar day is included when local midnight falls within `[startDate, endDate)`.

Returns:

```ts
type WeatherQueryResult = {
  current?: CurrentWeather;
  hourly?: HourWeather[];
  daily?: DayWeather[];
  minute?: MinuteWeather[] | null;
  alerts?: WeatherAlert[];
  availability?: WeatherAvailability;
};
```

Each type mirrors the Swift data we serialize (temperature units, UV index categories, gust speed, etc.), so you never have to touch the native layer.

### `getWeatherAttribution(): Promise<WeatherAttribution>`

Returns attribution information required for displaying weather data from Apple WeatherKit. **This is a legal requirement** for apps that display weather data.

```ts
type WeatherAttribution = {
  serviceName: string;
  legalPageURL: string;
  legalAttributionText: string;
  combinedMarkDarkURL?: string;
  combinedMarkLightURL?: string;
  squareMarkURL?: string;
};
```

**⚠️ Legal Requirements:**

If your app displays any weather data from Apple (other than weather alerts or value-added services), you **must**:

1. Display the **Apple Weather trademark** (the "Weather" mark) using the provided mark URLs (`combinedMarkLightURL`, `combinedMarkDarkURL`, or `squareMarkURL`).
2. Provide a link to the **legal attribution page** (`legalPageURL`) that contains copyright information about weather data sources.
3. Make the **legal attribution text** (`legalAttributionText`) available to users, especially for apps that cannot display the attribution URL contents in a Safari view.

Example:

```ts
const attribution = await ExpoWeatherKit.getWeatherAttribution();
console.log('Service:', attribution.serviceName);
console.log('Legal Text:', attribution.legalAttributionText);
console.log('Legal Page:', attribution.legalPageURL);
// Display the mark image from attribution.combinedMarkLightURL or combinedMarkDarkURL
```

---

## Example App

`example/App.tsx` demonstrates the full WeatherKit API with a complete UI. It includes:

- CTA buttons (Current Weather / Full Query / Query with custom ranges / Get Attribution)
- Cards for each dataset with pretty typography
- Alert list highlighting severity, source, and region
- Attribution information with legal text and mark images

**⚠️ Important:** The example app is configured with a specific Bundle ID and Apple Team ID. To run it, you must:

1. Update `example/app.json` with your own:
   - `bundleIdentifier` (must match a Bundle ID in your Apple Developer account)
   - `appleTeamId` (your Apple Developer Team ID)
2. Enable WeatherKit for that Bundle ID in the [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
3. Run `npx expo prebuild --clean` and `npx pod-install` after making changes

The example code serves as a reference implementation. You can copy patterns from `example/App.tsx` into your own app.

### Demo Video

Here's a screen recording of the example app in action:

https://github.com/user-attachments/assets/862db7d2-bd4e-45ef-afe3-aedc66c8bc01

> **Note:** The video demonstrates fetching current weather, hourly/daily forecasts, minute-by-minute precipitation, alerts, and attribution with mark images.

---

## Troubleshooting

- ❌ _“Value of type ‘X’ has no member ‘Y’”_ – ensure you’re compiling with Xcode 15+ and iOS 16+ SDKs.
- ❌ _“Missing entitlement com.apple.developer.weatherkit”_ – double‑check the Apple Developer portal toggle and regenerate credentials.
- ❌ _“Error: The operation couldn't be completed. (WeatherDaemon.WDSJWTAuthenticatorServiceListener.Errors error 2)”_ – this means you haven't enabled the **WeatherKit** service for your Bundle ID in the [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list). Go to your App ID, scroll to App Services, and ensure WeatherKit is checked. Save and regenerate your provisioning profiles.
- 🤔 Need more data sets (statistics, astronomical events)? PRs welcome!

---

## License

MIT © 2025 Jakub Cienciala. Contributions are welcome via GitHub issues / PRs.
