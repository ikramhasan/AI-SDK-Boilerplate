type SiteMetadata = {
  name: string
  metaTitle: string
  metaDescription: string
}

type SiteData = {
  site: SiteMetadata
}

export const siteData: SiteData = {
  site: {
    name: "HeyClaw",
    metaTitle: "HeyClaw — The All-in-One Autonomous AI Assistant",
    metaDescription:
      "Deploy autonomous AI agents for your professional and personal life. 1000+ integrations, zero config, instant setup.",
  },
}

export function getSiteName() {
  return siteData.site.name
}

export function getSiteMetadata() {
  return siteData.site
}
