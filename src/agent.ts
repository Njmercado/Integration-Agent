import { Agent } from "@strands-agents/sdk";
import { OpenAIModel } from '@strands-agents/sdk/openai'
import { fetchTool, integrateToolToAgent, listIntegrationsTool } from "./tools/index.js";
import dotenv from "dotenv";

dotenv.config();

const MODEL = process.env.MODEL;
const API_KEY = process.env.MODEL_API_KEY || "";

const model = new OpenAIModel({
  apiKey: API_KEY,
  modelId: MODEL,
});

const agent = new Agent({
  model,
  tools: [integrateToolToAgent, fetchTool, listIntegrationsTool],
  name: "Integration Agent",
  description: `
    You are an agent that can integrate with external services using the fetchTool.
    When given a requirement, the agent will determine if it needs to integrate a new service or call an existing one.
    
    # RULES:

    - If the requirement mentions a service that is not integrated, returns a message indicating the service needs to be integrated.
    - If the requirement mentions a service that is already integrated, determine which endpoint to call based on the requirement and call it using the fetchTool.
    - Always limit yourself to the tools available. Do not attempt to call any service that is not integrated or use any method that is not specified in the integrated endpoints.
    - Do not use internal data from model to give an answer, only use the tools available to you. If you don't have enough information to answer the requirement,
      return a message indicating what information you need and which tool you would use to get it.
  `,
});

export default agent;