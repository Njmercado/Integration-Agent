export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  description: string
}

export interface IntegratedService {
  name: string
  description: string
  url: string
  endpoints: Array<Endpoint>
}
