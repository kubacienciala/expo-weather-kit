export type ExpoWeatherKitModuleEvents = {};

export type CurrentWeather = {
  temperature: number;
  temperatureUnit: string;
  condition: string;
  humidity: number;
  windSpeed: number;
  windSpeedUnit: string;
  windDirection: number;
  pressure: number;
  pressureUnit: string;
  uvIndex: number;
  visibility: number;
  visibilityUnit: string;
  date: string;
};

export type DateRange = {
  start: number; // Unix timestamp in seconds
  end: number; // Unix timestamp in seconds
};

export type WeatherOptions = {
  latitude: number;
  longitude: number;
  current?: boolean;
  hourly?: boolean;
  daily?: boolean;
  minute?: boolean;
  alerts?: boolean;
  availability?: boolean;
  hourlyRange?: DateRange;
  dailyRange?: DateRange;
};

export type HourWeather = {
  date: number; // Unix timestamp
  temperature: number;
  temperatureUnit: string;
  apparentTemperature: number;
  apparentTemperatureUnit: string;
  condition: string;
  humidity: number;
  dewPoint: number;
  dewPointUnit: string;
  pressure: number;
  pressureUnit: string;
  pressureTrend: string;
  cloudCover: number;
  isDaylight: boolean;
  visibility: number;
  visibilityUnit: string;
  uvIndex: number;
  uvIndexCategory: string;
  windSpeed: number;
  windSpeedUnit: string;
  windDirection: number;
  windGust?: number;
  windGustUnit?: string;
  precipitation: string;
  precipitationChance: number;
  symbolName: string;
};

export type DayWeather = {
  date: number; // Unix timestamp
  high: number;
  highUnit: string;
  low: number;
  lowUnit: string;
  condition: string;
};

export type MinuteWeather = {
  date: number; // Unix timestamp
  precipitationDescription: string;
  precipitationChance: number;
  precipitationIntensity: number;
  precipitationIntensityUnit: string;
};

export type WeatherAlert = {
  summary: string;
  severity: string;
  source: string;
  detailsURL: string;
  region?: string;
};

export type WeatherAvailability = {
  alertAvailability: string;
  minuteAvailability: string;
};

export type WeatherQueryResult = {
  current?: CurrentWeather;
  hourly?: HourWeather[];
  daily?: DayWeather[];
  minute?: MinuteWeather[] | null;
  alerts?: WeatherAlert[];
  availability?: WeatherAvailability;
};
