import ExpoWeatherKit, {
  CurrentWeather,
  DayWeather,
  HourWeather,
  MinuteWeather,
  WeatherAlert,
  WeatherAttribution,
  WeatherOptions,
  WeatherQueryResult,
} from 'expo-weather-kit';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [queryResult, setQueryResult] = useState<WeatherQueryResult | null>(
    null
  );
  const [attribution, setAttribution] = useState<WeatherAttribution | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default location: Kraków, Poland
  const defaultLatitude = 50.2080466;
  const defaultLongitude = 19.1660513;

  const [latitudeInput, setLatitudeInput] = useState(
    defaultLatitude.toString()
  );
  const [longitudeInput, setLongitudeInput] = useState(
    defaultLongitude.toString()
  );
  const [hourlyRangeHours, setHourlyRangeHours] = useState('24');
  const [dailyRangeDays, setDailyRangeDays] = useState('7');

  const resolvedLatitude =
    parseFloat(latitudeInput.replace(',', '.')) || defaultLatitude;
  const resolvedLongitude =
    parseFloat(longitudeInput.replace(',', '.')) || defaultLongitude;

  const fetchCurrentWeather = async () => {
    setLoading(true);
    setError(null);
    setQueryResult(null);
    try {
      const result = await ExpoWeatherKit.getCurrentWeather(
        resolvedLatitude,
        resolvedLongitude
      );
      setWeather(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch weather';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherQuery = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const options: WeatherOptions = {
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,
        current: true,
        hourly: true,
        daily: true,
        minute: true,
        alerts: true,
        availability: true,
      };
      const result = await ExpoWeatherKit.getWeatherQuery(options);
      setQueryResult(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch weather query';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherQueryWithRange = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const now = Date.now() / 1000;
      const hours = Math.max(
        1,
        Math.min(168, Number(hourlyRangeHours.replace(',', '.')) || 0)
      );
      const days = Math.max(
        1,
        Math.min(15, Number(dailyRangeDays.replace(',', '.')) || 0)
      );

      const options: WeatherOptions = {
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,
        current: true,
        hourly: true,
        hourlyRange: {
          start: now,
          end: now + hours * 60 * 60,
        },
        daily: true,
        dailyRange: {
          start: now,
          end: now + days * 24 * 60 * 60,
        },
        alerts: true,
        availability: true,
      };
      const result = await ExpoWeatherKit.getWeatherQuery(options);
      setQueryResult(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch weather query with range';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttribution = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setQueryResult(null);
    setAttribution(null);
    try {
      const result = await ExpoWeatherKit.getWeatherAttribution();
      setAttribution(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch weather attribution';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Text style={styles.header}>WeatherKit Example</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput
            value={latitudeInput}
            onChangeText={setLatitudeInput}
            keyboardType='decimal-pad'
            placeholder='Latitude'
            style={styles.textInput}
          />
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput
            value={longitudeInput}
            onChangeText={setLongitudeInput}
            keyboardType='decimal-pad'
            placeholder='Longitude'
            style={styles.textInput}
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeColumn}>
              <Text style={styles.inputLabel}>Hourly range (hours)</Text>
              <TextInput
                value={hourlyRangeHours}
                onChangeText={setHourlyRangeHours}
                keyboardType='number-pad'
                placeholder='24'
                style={styles.textInput}
              />
            </View>
            <View style={styles.rangeColumn}>
              <Text style={styles.inputLabel}>Daily range (days)</Text>
              <TextInput
                value={dailyRangeDays}
                onChangeText={setDailyRangeDays}
                keyboardType='number-pad'
                placeholder='7'
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={fetchCurrentWeather}
            disabled={loading}>
            <Text style={styles.buttonText}>Current Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={fetchWeatherQuery}
            disabled={loading}>
            <Text style={styles.buttonText}>Full Query</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={fetchWeatherQueryWithRange}
            disabled={loading}>
            <Text style={styles.buttonText}>Query with Range</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={fetchAttribution}
            disabled={loading}>
            <Text style={styles.buttonText}>Get Attribution</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#007AFF' />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        )}

        {error && (
          <View style={styles.group}>
            <Text style={styles.groupHeader}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {weather && (
          <View style={styles.group}>
            <Text style={styles.groupHeader}>Current Weather</Text>
            <WeatherInfo weather={weather} />
          </View>
        )}

        {queryResult && (
          <View style={styles.group}>
            <Text style={styles.groupHeader}>Weather Query Result</Text>
            <WeatherQueryInfo result={queryResult} />
          </View>
        )}

        {attribution && (
          <View style={styles.group}>
            <Text style={styles.groupHeader}>Weather Attribution</Text>
            <AttributionInfo attribution={attribution} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WeatherInfo({ weather }: { weather: CurrentWeather }) {
  return (
    <View style={styles.weatherContainer}>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Temperature:</Text>
        <Text style={styles.weatherValue}>
          {weather.temperature.toFixed(1)} {weather.temperatureUnit}
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Condition:</Text>
        <Text style={styles.weatherValue}>{weather.condition}</Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Humidity:</Text>
        <Text style={styles.weatherValue}>
          {(weather.humidity * 100).toFixed(1)}%
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Wind Speed:</Text>
        <Text style={styles.weatherValue}>
          {weather.windSpeed.toFixed(1)} {weather.windSpeedUnit}
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Wind Direction:</Text>
        <Text style={styles.weatherValue}>
          {weather.windDirection.toFixed(0)}°
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Pressure:</Text>
        <Text style={styles.weatherValue}>
          {weather.pressure.toFixed(1)} {weather.pressureUnit}
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>UV Index:</Text>
        <Text style={styles.weatherValue}>{weather.uvIndex}</Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Visibility:</Text>
        <Text style={styles.weatherValue}>
          {weather.visibility.toFixed(1)} {weather.visibilityUnit}
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherLabel}>Date:</Text>
        <Text style={styles.weatherValue}>
          {new Date(weather.date).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function WeatherQueryInfo({ result }: { result: WeatherQueryResult }) {
  return (
    <View style={styles.queryContainer}>
      {result.current && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Temperature:</Text>
            <Text style={styles.weatherValue}>
              {result.current.temperature.toFixed(1)}{' '}
              {result.current.temperatureUnit}
            </Text>
          </View>
          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Condition:</Text>
            <Text style={styles.weatherValue}>{result.current.condition}</Text>
          </View>
          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Humidity:</Text>
            <Text style={styles.weatherValue}>
              {(result.current.humidity * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      {result.hourly && result.hourly.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Hourly Forecast ({result.hourly.length} hours)
          </Text>
          {result.hourly.slice(0, 8).map((hour: HourWeather, index: number) => (
            <View key={index} style={styles.forecastItem}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastTime}>
                  {new Date(hour.date * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.forecastCondition}>{hour.condition}</Text>
              </View>
              <Text style={styles.forecastValue}>
                {hour.temperature.toFixed(1)} {hour.temperatureUnit} (feels like{' '}
                {hour.apparentTemperature.toFixed(1)}{' '}
                {hour.apparentTemperatureUnit})
              </Text>
              <Text style={styles.forecastDetails}>
                Precip: {(hour.precipitationChance * 100).toFixed(0)}% |
                Humidity: {(hour.humidity * 100).toFixed(0)}% | Wind:{' '}
                {hour.windSpeed.toFixed(1)} {hour.windSpeedUnit}
              </Text>
            </View>
          ))}
          {result.hourly.length > 8 && (
            <Text style={styles.moreText}>
              ... and {result.hourly.length - 8} more hours
            </Text>
          )}
        </View>
      )}

      {result.daily && result.daily.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Daily Forecast ({result.daily.length} days)
          </Text>
          {result.daily.slice(0, 7).map((day: DayWeather, index: number) => (
            <View key={index} style={styles.forecastItem}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastTime}>
                  {new Date(day.date * 1000).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.forecastCondition}>{day.condition}</Text>
              </View>
              <Text style={styles.forecastValue}>
                High: {day.high.toFixed(1)} {day.highUnit} | Low:{' '}
                {day.low.toFixed(1)} {day.lowUnit}
              </Text>
            </View>
          ))}
          {result.daily.length > 7 && (
            <Text style={styles.moreText}>
              ... and {result.daily.length - 7} more days
            </Text>
          )}
        </View>
      )}

      {result.minute &&
        Array.isArray(result.minute) &&
        result.minute.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Minute Forecast ({result.minute.length} minutes)
            </Text>
            {result.minute
              .slice(0, 12)
              .map((minute: MinuteWeather, index: number) => (
                <View key={index} style={styles.forecastItem}>
                  <View style={styles.forecastHeader}>
                    <Text style={styles.forecastTime}>
                      {new Date(minute.date * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.forecastValue}>
                      {(minute.precipitationChance * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <Text style={styles.forecastDetails}>
                    {minute.precipitationDescription} - Intensity:{' '}
                    {minute.precipitationIntensity.toFixed(2)}{' '}
                    {minute.precipitationIntensityUnit}
                  </Text>
                </View>
              ))}
            {result.minute.length > 12 && (
              <Text style={styles.moreText}>
                ... and {result.minute.length - 12} more minutes
              </Text>
            )}
          </View>
        )}

      {result.minute === null && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minute Forecast</Text>
          <Text style={styles.sectionText}>
            Not available for this location
          </Text>
        </View>
      )}

      {result.alerts && result.alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Weather Alerts ({result.alerts.length})
          </Text>
          {result.alerts.map((alert: WeatherAlert, index: number) => (
            <View key={index} style={styles.alertItem}>
              <Text style={styles.alertSeverity}>
                {alert.severity.toUpperCase()}
              </Text>
              <Text style={styles.alertSummary}>{alert.summary}</Text>
              <Text style={styles.alertSource}>Source: {alert.source}</Text>
              {alert.region && (
                <Text style={styles.alertRegion}>Region: {alert.region}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {result.alerts && result.alerts.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Alerts</Text>
          <Text style={styles.sectionText}>No active weather alerts</Text>
        </View>
      )}

      {result.availability && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Availability</Text>
          <Text style={styles.sectionText}>
            Alert Availability: {result.availability.alertAvailability}
          </Text>
          <Text style={styles.sectionText}>
            Minute Forecast Availability:{' '}
            {result.availability.minuteAvailability}
          </Text>
        </View>
      )}
    </View>
  );
}

function AttributionInfo({ attribution }: { attribution: WeatherAttribution }) {
  return (
    <View style={styles.queryContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Name</Text>
        <Text style={styles.sectionText}>{attribution.serviceName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Attribution Text</Text>
        <Text style={styles.sectionText}>
          {attribution.legalAttributionText}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Page URL</Text>
        <Text style={styles.sectionText}>{attribution.legalPageURL}</Text>
      </View>

      {attribution.combinedMarkLightURL && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combined Mark (Light)</Text>
          <Image
            source={{ uri: attribution.combinedMarkLightURL }}
            style={styles.attributionImage}
            resizeMode='contain'
          />
          <Text style={styles.sectionText}>
            {attribution.combinedMarkLightURL}
          </Text>
        </View>
      )}

      {attribution.combinedMarkDarkURL && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combined Mark (Dark)</Text>
          <View style={styles.darkImageContainer}>
            <Image
              source={{ uri: attribution.combinedMarkDarkURL }}
              style={styles.attributionImage}
              resizeMode='contain'
            />
          </View>
          <Text style={styles.sectionText}>
            {attribution.combinedMarkDarkURL}
          </Text>
        </View>
      )}

      {attribution.squareMarkURL && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Square Mark</Text>
          <Image
            source={{ uri: attribution.squareMarkURL }}
            style={{ ...styles.attributionImage, width: 64, height: 64 }}
            resizeMode='contain'
          />
          <Text style={styles.sectionText}>{attribution.squareMarkURL}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rangeColumn: {
    flex: 1,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  weatherContainer: {
    marginTop: 10,
  },
  queryContainer: {
    marginTop: 10,
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  attributionImage: {
    width: '100%',
    height: 10,
    marginVertical: 10,
  },
  darkImageContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  forecastItem: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forecastTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  forecastCondition: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  forecastValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  forecastDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  alertItem: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  alertSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertSource: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertRegion: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weatherLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
});
