/** Toolkit as returned by the list endpoint (session.toolkits()) */
export interface ToolkitListItem {
  slug: string
  name: string
  logo?: string
  isConnected: boolean
  connectedAccountId?: string
}

/** Category within a toolkit's metadata */
export interface ToolkitCategory {
  slug: string
  name: string
}

/** Full toolkit detail returned by the detail endpoint */
export interface ToolkitDetail {
  slug: string
  name: string
  description?: string
  logo?: string
  appUrl?: string
  baseUrl?: string
  categories: ToolkitCategory[]
  toolsCount: number
  triggersCount: number
  authSchemes: string[]
  isConnected: boolean
  connectedAccountId?: string
  createdAt?: string
  updatedAt?: string
  availableVersions: string[]
}

/** JSON Schema property for tool parameters */
export interface ToolParameterProperty {
  type?: string
  description?: string
  required?: boolean
  enum?: string[]
  examples?: unknown[]
  default?: unknown
}

/** Tool parameter schema */
export interface ToolParameterSchema {
  type: "object"
  properties: Record<string, ToolParameterProperty>
  required?: string[]
  description?: string
}

/** A single tool within a toolkit */
export interface ToolkitTool {
  slug: string
  name: string
  description?: string
  tags: string[]
  version?: string
  isDeprecated: boolean
  scopes: string[]
  inputParameters?: ToolParameterSchema
  outputParameters?: ToolParameterSchema
}
