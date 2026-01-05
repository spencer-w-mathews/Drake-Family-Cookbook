import type {SanityImageSource} from '@sanity/image-url/lib/types/types'

export type Ingredient = {
  _key: string
  item: string
  quantity?: string
  unit?: string
  note?: string
}

export type Recipe = {
  _id: string
  title: string
  slug?: {current: string}
  shortDescription?: string
  familyMember?: string
  servings?: number
  prepTime?: number
  cookTime?: number
  difficulty?: string
  tags?: string[]
  tips?: string
  heroImage?: SanityImageSource
  ingredients?: Ingredient[]
  instructions?: string[]
}
