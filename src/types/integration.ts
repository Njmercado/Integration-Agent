export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  description: string
}

/**
 * Describes one callable HTTP endpoint exposed by an integrated external service.
 *
 * @example
 * const endpoint: Endpoint = {
 *   method: "GET",
 *   endpoint: "/current.json?q={city}&key={apiKey}",
 *   description: "Returns current weather conditions for the given city."
 * }
 */
export interface Endpoint {
  /**
   * HTTP method used to call the endpoint.
   */
  method: "GET" | "POST" | "PUT" | "DELETE"

  /**
   * Relative path appended to the service base URL.
   * Prefer starting with "/" for consistency.
   *
   * @example "/forecast.json?q={city}&days=3&key={apiKey}"
   */
  endpoint: string

  /**
   * Human-readable description of what the endpoint does.
   */
  description: string
}

/**
 * Represents an external service that the agent can use.
 * A service groups a base URL plus one or more endpoints.
 *
 * @example
 * const weatherService: IntegratedService = {
 *   name: "WeatherAPI",
 *   description: "Provides current weather and forecast data.",
 *   url: "https://api.weatherapi.com/v1",
 *   endpoints: [
 *     {
 *       method: "GET",
 *       endpoint: "/current.json?q={city}&key={apiKey}",
 *       description: "Gets live weather for a city."
 *     },
 *     {
 *       method: "GET",
 *       endpoint: "/forecast.json?q={city}&days=3&key={apiKey}",
 *       description: "Gets 3-day forecast for a city."
 *     }
 *   ]
 * }
 */
export interface IntegratedService {
  /**
   * Unique service name used for lookup and display.
   *
   * @example "WeatherAPI"
   */
  name: string

  /**
   * Short summary of what the service provides.
   */
  description: string

  /**
   * Base URL used to build full request URLs for endpoints.
   * Use HTTPS whenever possible.
   *
   * @example "https://api.weatherapi.com/v1"
   */
  url: string

  /**
   * List of endpoints that can be called for this service.
   */
  endpoints: Array<Endpoint>
}export interface IntegratedService {
  name: string
  description: string
  url: string
  endpoints: Array<Endpoint>
}
