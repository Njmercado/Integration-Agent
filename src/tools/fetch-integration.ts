import { tool } from "@strands-agents/sdk"
import { z } from "zod"
import { findServiceByName } from "../persistence/services.js"

const MAX_RETRIES = 3

export const fetchTool = tool({
  name: "fetchTool",
  description: `
    A tool to make HTTP requests to integrated services.
    Based on user description you will determine which service and endpoint to call, and with which method.
    If the retrieved information is not enough to make the call, return a message indicating what information
    is missing and which tool you would use to retrieve it.

    The response from the called service should be transformed into the following format before returning it:
    {
      "source": "service_name",
      "data": {},
      "normalized_at": "timestamp"
    }
  `,
  inputSchema: z.object({
    service: z.string().describe("The name of the integrated service to call"),
    endpoint: z.string().describe("The endpoint path to call"),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("The HTTP method to use"),
  }),
  callback: async (input) => {
    const { service, endpoint, method } = input

    console.log('fetchTool called with:', { service, endpoint, method })

    /**
     * Eventough the agent should know which service and endpoint to call based on the requirement,
     * we need to validate that the service and endpoint actually exist before making the call.
     * Also to avoid allucinations its necessary to fetch the service from a know and trusted source.
     */
    const foundService = await findServiceByName(service)

    if (!foundService) {
      throw new Error(`Service ${service} not found`)
    }

    const foundEndpoint = foundService.endpoints.find((ep) => ep.endpoint === endpoint)

    if (!foundEndpoint) {
      throw new Error(`Endpoint ${endpoint} not found for service ${service}`)
    }

    for(let i = 0; i < MAX_RETRIES; i++) {
      const result = await fetch(foundService.url + foundEndpoint.endpoint, { method })
      const data = await result.json()
      if (result.ok) {
        console.log(`Successfully called ${service} at ${endpoint} with method ${method}. Response:`, data)
        return JSON.stringify({
          source: service,
          data: data,
          normalized_at: new Date().toISOString()
        });
      } else {
        console.error(`Failed to call ${service} at ${endpoint} with method ${method}. Attempt ${i + 1} of ${MAX_RETRIES}`)
      }
    }

    return "Failed to call the service after multiple attempts. Please check the service status and try again later."
  },
})
