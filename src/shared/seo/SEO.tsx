import { Helmet } from 'react-helmet-async'

type SEOProps = {
  title: string
  description?: string
  canonical?: string
  image?: string
}

const SITE_NAME = 'Mytinerary'
const DEFAULT_DESCRIPTION = 'Discover unique itineraries curated by the people who know their cities best. Find your perfect trip, designed by insiders who know and love their cities.'
const SITE_URL = 'https://mytinerary.app'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop'

export const SEO = ({ title, description = DEFAULT_DESCRIPTION, canonical, image = DEFAULT_IMAGE }: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {canonical && <link rel="canonical" href={url} />}
    </Helmet>
  )
}
