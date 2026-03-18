import { tool } from "@strands-agents/sdk"
import { z } from "zod"
import { listServices } from "../persistence/services.js"

export const listIntegrationsTool = tool({
  name: "listIntegrationsTool",
  description: "A tool to list all currently integrated services and their endpoints.",
  inputSchema: z.object({}),
  callback: async () => {
    const services = await listServices()
    return JSON.stringify(services.map(service => ({
      name: service.name,
      url: service.url,
      description: service.description,
      endpoints: service.endpoints,
    })))
  },
})