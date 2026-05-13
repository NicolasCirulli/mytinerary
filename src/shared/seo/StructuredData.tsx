import { Helmet } from 'react-helmet-async'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mytinerary',
  url: 'https://mytinerary.app',
  description:
    'Discover unique itineraries curated by the people who know their cities best.',
  slogan: 'Travel Like a Local',
  sameAs: ['https://twitter.com/mytinerary', 'https://facebook.com/mytinerary', 'https://instagram.com/mytinerary'],
}

export const OrganizationSchema = () => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
  </Helmet>
)
