import { tool } from "@strands-agents/sdk"
import { z } from "zod"
import type { IntegratedService } from "../types/integration.js"
import { upsertService } from "../persistence/services.js"

/**
 * This tool is used to integrate new services into the agent.
 * It takes the service information as input and stores it in the database.
 */
export const integrateToolToAgent = tool({
  name: "integrateToolToAgent",
  description: "A tool to integrate new services into the agent.",
  inputSchema: z.object({
    name: z.string().describe("The name of the service to integrate"),
    url: z.string().describe("The base URL of the service"),
    description: z.string().describe("A brief description of the service"),
    endpoints: z.array(
      z.object({
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("The HTTP method of the endpoint"),
        endpoint: z.string().describe("The endpoint path to call"),
        description: z.string().describe("A brief description of the endpoint"),
      })
    ).describe("An array of endpoints to integrate from the service"),
  }),
  callback: async (input) => {
    const { name, url, description, endpoints } = input
    const newService: IntegratedService = { name, url, description, endpoints }
    await upsertService(newService)
    return `${JSON.stringify(newService)}`; 
  },
})