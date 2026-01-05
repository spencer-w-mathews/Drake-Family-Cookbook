import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'dy4soqkj'
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false
})

const builder = imageUrlBuilder(client)

export const urlFor = (source?: SanityImageSource | null) => {
  if (!source) return null
  try {
    return builder.image(source)
  } catch {
    return null
  }
}
