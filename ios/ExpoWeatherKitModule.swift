import ExpoModulesCore
import WeatherKit
import CoreLocation
import Foundation

public struct WeatherOptions: Codable {
    let latitude: Double
    let longitude: Double

    let current: Bool?
    let hourly: Bool?
    let daily: Bool?
    let minute: Bool?
    let alerts: Bool?
    let availability: Bool?
    
    let hourlyRange: DateRange?
    let dailyRange: DateRange?
}

public struct DateRange: Codable {
    let start: Double
    let end: Double
}


public class ExpoWeatherKitModule: Module {
    
    public func definition() -> ModuleDefinition {
        Name("ExpoWeatherKit")
        
        AsyncFunction("getCurrentWeather") { (latitude: Double, longitude: Double) async throws -> [String: Any] in
            let location = CLLocation(latitude: latitude, longitude: longitude)
            let service = WeatherService.shared
            let weather = try await service.weather(for: location)
            
            let currentWeather = weather.currentWeather
            
            return [
                "temperature": currentWeather.temperature.value,
                "temperatureUnit": currentWeather.temperature.unit.symbol,
                "condition": currentWeather.condition.description,
                "humidity": currentWeather.humidity,
                "windSpeed": currentWeather.wind.speed.value,
                "windSpeedUnit": currentWeather.wind.speed.unit.symbol,
                "windDirection": currentWeather.wind.direction.value,
                "pressure": currentWeather.pressure.value,
                "pressureUnit": currentWeather.pressure.unit.symbol,
                "uvIndex": currentWeather.uvIndex.value,
                "visibility": currentWeather.visibility.value,
                "visibilityUnit": currentWeather.visibility.unit.symbol,
                "date": ISO8601DateFormatter().string(from: currentWeather.date)
            ]
        }
        
        AsyncFunction("getWeatherQuery") { (options: [String: Any]) async throws -> [String: Any] in
            
            let jsonData = try JSONSerialization.data(withJSONObject: options)
            let weatherOptions = try JSONDecoder().decode(WeatherOptions.self, from: jsonData)
            
            let location = CLLocation(latitude: weatherOptions.latitude, longitude: weatherOptions.longitude)
            let service = WeatherService.shared
            var result: [String: Any] = [:]
            
            // Current
            if weatherOptions.current == true {
                let currentWeather = try await service.weather(for: location, including: .current)
                result["current"] = currentWeather.asJson()
            }
            
            // Hourly
            if let range = weatherOptions.hourlyRange {
                let hourlyForecast = try await service.weather(
                    for: location,
                    including: .hourly(startDate: Date(timeIntervalSince1970: range.start),
                                       endDate: Date(timeIntervalSince1970: range.end))
                )
                result["hourly"] = hourlyForecast.asJson()
            } else if weatherOptions.hourly == true {
                let hourlyForecast = try await service.weather(for: location, including: .hourly)
                result["hourly"] = hourlyForecast.asJson()
            }
            
            // Daily
            if let range = weatherOptions.dailyRange {
                let dailyForecast = try await service.weather(
                    for: location,
                    including: .daily(startDate: Date(timeIntervalSince1970: range.start),
                                      endDate: Date(timeIntervalSince1970: range.end))
                )
                result["daily"] = dailyForecast.asJson()
            } else if weatherOptions.daily == true {
                let dailyForecast = try await service.weather(for: location, including: .daily)
                result["daily"] = dailyForecast.asJson()
            }
            
            // Minute
            if weatherOptions.minute == true {
                if let minuteForecast = try? await service.weather(for: location, including: .minute) {
                    result["minute"] = minuteForecast.asJson()
                } else {
                    result["minute"] = NSNull()
                }
            }
            
            // Alerts
            if weatherOptions.alerts == true {
                if let alerts = try? await service.weather(for: location, including: .alerts) {
                    result["alerts"] = alerts.map { alert in
                        var alertDict: [String: Any] = [
                            "summary": alert.summary,
                            "severity": alert.severity.rawValue,
                            "source": alert.source,
                            "detailsURL": alert.detailsURL.absoluteString
                        ]
                        if let region = alert.region {
                            alertDict["region"] = region
                        }
                        return alertDict
                    }
                } else {
                    result["alerts"] = []
                }
            }
            
            // Availability
            if weatherOptions.availability == true {
                if let availability = try? await service.weather(for: location, including: .availability) {
                    result["availability"] = [
                        "alertAvailability": availability.alertAvailability.rawValue,
                        "minuteAvailability": availability.minuteAvailability.rawValue
                    ]
                } else {
                    result["availability"] = [:]
                }
            }
            
            return result
        }
    }
}

extension CurrentWeather {
    func asJson() -> [String: Any] {
        [
            "temperature": temperature.value,
            "temperatureUnit": temperature.unit.symbol,
            "condition": condition.description,
            "humidity": humidity,
            "windSpeed": wind.speed.value,
            "windSpeedUnit": wind.speed.unit.symbol,
            "windDirection": wind.direction.value,
            "pressure": pressure.value,
            "pressureUnit": pressure.unit.symbol,
            "uvIndex": uvIndex.value,
            "visibility": visibility.value,
            "visibilityUnit": visibility.unit.symbol,
            "date": ISO8601DateFormatter().string(from: date)
        ]
    }
}

// MARK: - Extensions
extension Forecast where Element == HourWeather {
    func asJson() -> [[String: Any]] {
        self.forecast.map { hour in
            var result: [String: Any] = [
                "date": hour.date.timeIntervalSince1970,
                "temperature": hour.temperature.value,
                "temperatureUnit": hour.temperature.unit.symbol,
                "apparentTemperature": hour.apparentTemperature.value,
                "apparentTemperatureUnit": hour.apparentTemperature.unit.symbol,
                "condition": hour.condition.rawValue,
                "humidity": hour.humidity,
                "dewPoint": hour.dewPoint.value,
                "dewPointUnit": hour.dewPoint.unit.symbol,
                "pressure": hour.pressure.value,
                "pressureUnit": hour.pressure.unit.symbol,
                "pressureTrend": hour.pressureTrend.rawValue,
                "cloudCover": hour.cloudCover,
                "isDaylight": hour.isDaylight,
                "visibility": hour.visibility.value,
                "visibilityUnit": hour.visibility.unit.symbol,
                "uvIndex": hour.uvIndex.value,
                "uvIndexCategory": hour.uvIndex.category.rawValue,
                "windSpeed": hour.wind.speed.value,
                "windSpeedUnit": hour.wind.speed.unit.symbol,
                "windDirection": hour.wind.direction.value,
                "precipitation": hour.precipitation.rawValue,
                "precipitationChance": hour.precipitationChance,
                "symbolName": hour.symbolName
            ]
            
            if let gust = hour.wind.gust {
                result["windGust"] = gust.value
                result["windGustUnit"] = gust.unit.symbol
            }
            
            return result
        }
    }
}

extension Forecast where Element == DayWeather {
    func asJson() -> [[String: Any]] {
        self.forecast.map { day in
            [
                "date": day.date.timeIntervalSince1970,
                "high": day.highTemperature.value,
                "highUnit": day.highTemperature.unit.symbol,
                "low": day.lowTemperature.value,
                "lowUnit": day.lowTemperature.unit.symbol,
                "condition": day.condition.rawValue
            ]
        }
    }
}

extension Forecast where Element == MinuteWeather {
    func asJson() -> [[String: Any]] {
        self.forecast.map { minute in
            [
                "date": minute.date.timeIntervalSince1970,
                "precipitationDescription": minute.precipitationIntensity.value > 0 ? "Rain" : "None",
                "precipitationChance": minute.precipitationChance,
                "precipitationIntensity": minute.precipitationIntensity.value,
                "precipitationIntensityUnit": minute.precipitationIntensity.unit.symbol
            ]
        }
    }
}


