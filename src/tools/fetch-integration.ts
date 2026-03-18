import { tool } from "@strands-agents/sdk"
import { z } from "zod"
import { findServiceByName } from "../persistence/services.js"

export const fetchTool = tool({
  name: "fetchTool",
  description: `
    A tool to make HTTP requests to integrated services.
    Based on user description you will determine which service and endpoint to call, and with which method.
  `,
  inputSchema: z.object({
    service: z.string().describe("The name of the integrated service to call"),
    endpoint: z.string().describe("The endpoint path to call"),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("The HTTP method to use"),
  }),
  callback: async (input) => {
    const { service, endpoint, method } = input

    /** Eventough the agent should know which service and endpoint to call based on the requirement,
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

    const result = await fetch(foundService.url + foundEndpoint.endpoint, { method })

    return result.text()
  },
})
