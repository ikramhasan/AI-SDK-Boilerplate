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
    name: "AI SDK Boilerplate",
    metaTitle: "AI SDK Boilerplate",
    metaDescription:
      "AI SDK Boilerplate is a boilerplate for building AI SDK applications.",
  },
}

export function getSiteName() {
  return siteData.site.name
}

export function getSiteMetadata() {
  return siteData.site
}
