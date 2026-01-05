import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {client} from '../sanityClient'
import type {Recipe} from '../types/recipe'
import {getDifficultyLabel} from '../utils/recipeFormatting'

const recipeQuery = `*[_type == "recipe"] | order(title asc) {
  _id,
  title,
  slug,
  shortDescription,
  familyMember,
  servings,
  prepTime,
  cookTime,
  difficulty,
  tags,
  tips,
  heroImage,
  ingredients[]{
    _key,
    quantity,
    unit,
    item,
    note
  },
  instructions
}`

const cardAccents = ['sage', 'rose', 'amber', 'sky'] as const
const accentColors: Record<(typeof cardAccents)[number], string> = {
  sage: '#6c8f73',
  rose: '#a63d40',
  amber: '#c59a4a',
  sky: '#5b7fa2',
}

const HomePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const data = await client.fetch<Recipe[]>(recipeQuery)
        setRecipes(data)
      } catch (err) {
        console.error(err)
        setError('We could not reach the recipe box right now. Please try again soon.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    recipes.forEach((recipe) => recipe.tags?.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return recipes.filter((recipe) => {
      const matchesSearch =
        !normalizedSearch ||
        recipe.title.toLowerCase().includes(normalizedSearch) ||
        recipe.shortDescription?.toLowerCase().includes(normalizedSearch)

      const matchesTag = tagFilter === 'all' || recipe.tags?.includes(tagFilter)
      return matchesSearch && matchesTag
    })
  }, [recipes, searchTerm, tagFilter])


  return (
    <Page>
      <Hero>
        <HeroContent>
          <Eyebrow>Drake Family Cookbook</Eyebrow>
          <h1>Comfort cooking, saved in one cozy kitchen.</h1>
          <Lede>
            Browse every treasured recipe from the family box. Search, filter, and open the full
            recipe page to see every detail.
          </Lede>
          <HeroActions>
            <Button as="a" href="#recipes" $variant="primary">
              Jump to recipes
            </Button>
          </HeroActions>
        </HeroContent>
      </Hero>

      <Filters id="recipes">
        <div>
          <Eyebrow>Find a recipe</Eyebrow>
          <SearchRow>
            <SearchInput
              id="search"
              type="search"
              placeholder="Search by name or description"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Count>
              {loading ? 'Loading…' : ``}
            </Count>
          </SearchRow>
        </div>

        <div>
          <Eyebrow>Filter by tag</Eyebrow>
          <ChipRow>
            <Chip type="button" $active={tagFilter === 'all'} onClick={() => setTagFilter('all')}>
              All
            </Chip>
            {availableTags.map((tag) => (
              <Chip
                key={tag}
                type="button"
                $active={tagFilter === tag}
                onClick={() => setTagFilter(tag)}
              >
                {tag}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </Filters>

      {error && <Alert>{error}</Alert>}

      {loading && (
        <InlineLoading>
          <LoaderDot />
          <LoaderDot />
          <LoaderDot />
          <span>Gathering recipes…</span>
        </InlineLoading>
      )}

      {!loading && !recipes.length && !error && (
        <EmptyState>
          <h3>Ready for the first recipe</h3>
        </EmptyState>
      )}

      {!loading && filteredRecipes.length === 0 && recipes.length > 0 && (
        <EmptyState>
          <h3>No matches yet</h3>
          <p>Try clearing your search or switching tags.</p>
        </EmptyState>
      )}

      {!loading && filteredRecipes.length > 0 && (
        <RecipeGrid>
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              accent={cardAccents[index % cardAccents.length]}
            />
          ))}
        </RecipeGrid>
      )}

      {/* Spotlight section available if you want to feature a recipe later */}
    </Page>
  )
}

type CardProps = {
  recipe: Recipe
  accent: (typeof cardAccents)[number]
}

const RecipeCard = ({recipe, accent}: CardProps) => {
  const slug = recipe.slug?.current
  const target = slug ? `/recipes/${slug}` : '/'
  const difficulty = getDifficultyLabel(recipe.difficulty)

  return (
    <RecipeCardContainer accent={accent} to={target}>
      <Eyebrow>{recipe.familyMember ? `Shared by ${recipe.familyMember}` : 'Family recipe'}</Eyebrow>
      <h3>{recipe.title}</h3>
      <Muted>{recipe.shortDescription || 'No description yet.'}</Muted>

      <div>
        {difficulty ? <span>{difficulty}</span> : null}
        {recipe.tags && recipe.tags.length > 0 ? (
          <TagsInline>
            {recipe.tags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
          </TagsInline>
        ) : null}
      </div>
    </RecipeCardContainer>
  )
}



const Page = styled.main`
  max-width: 1200px;
  margin: 0 auto 120px;
  padding: 32px 20px 64px;
`

const Hero = styled.header`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  background: linear-gradient(135deg, rgba(166, 61, 64, 0.08), rgba(108, 143, 115, 0.1)),
    ${({theme}) => theme.colors.surface};
  border: 1px solid #e7d9c5;
  border-radius: 28px;
  padding: 32px;
  box-shadow: ${({theme}) => theme.shadows.hero};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const HeroContent = styled.div`
  h1 {
    font-size: clamp(32px, 3vw, 44px);
  }
`

const HeroActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`


const Filters = styled.section`
  margin: 32px 0 12px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: end;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({theme}) => theme.colors.surface};
  border: 1px solid #e7d9c5;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: ${({theme}) => theme.shadows.card};
`

const SearchInput = styled.input`
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;
  padding: 10px 0;
  background: transparent;
`

const Count = styled.div`
  font-weight: 600;
  color: ${({theme}) => theme.colors.sageStrong};
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{$active: boolean}>`
  border: 1px solid #d9c9b5;
  background: ${({$active, theme}) => ($active ? theme.colors.sage : theme.colors.surfaceSoft)};
  color: ${({$active}) => ($active ? '#ffffff' : 'inherit')};
  padding: 8px 12px;
  border-radius: ${({theme}) => theme.radii.pill};
  cursor: pointer;
  transition: all 0.2s ease;
`

const Button = styled.button<{$variant?: 'primary' | 'ghost' | 'text'}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({$variant}) => ($variant === 'text' ? '4px 0' : '10px 16px')};
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
  background: ${({$variant, theme}) =>
    $variant === 'primary'
      ? `linear-gradient(135deg, ${theme.colors.berry}, #c96457)`
      : $variant === 'ghost'
      ? theme.colors.surfaceSoft
      : 'transparent'};
  color: ${({$variant, theme}) =>
    $variant === 'primary'
      ? '#ffffff'
      : $variant === 'ghost'
      ? theme.colors.ink
      : theme.colors.berry};
  border-color: ${({$variant, theme}) =>
    $variant === 'primary'
      ? theme.colors.berryStrong
      : $variant === 'ghost'
      ? '#e7d9c5'
      : 'transparent'};
  box-shadow: ${({$variant, theme}) =>
    $variant === 'primary'
      ? '0 10px 30px rgba(166, 61, 64, 0.28)'
      : $variant === 'ghost'
      ? theme.shadows.card
      : 'none'};
`

const Pill = styled.span<{$muted?: boolean; $ghost?: boolean}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${({theme}) => theme.radii.pill};
  background: ${({$muted, $ghost}) =>
    $muted ? 'rgba(255, 255, 255, 0.84)' : $ghost ? 'rgba(255, 255, 255, 0.12)' : 'rgba(31, 38, 34, 0.08)'};
  border: ${({$ghost}) => ($ghost ? '1px solid rgba(255, 255, 255, 0.28)' : 'none')};
  font-size: 12px;
  font-weight: 600;
  color: ${({$ghost, $muted, theme}) =>
    $ghost || $muted ? '#ffffff' : theme.colors.ink};
`

const Eyebrow = styled.p`
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 20px;
  color: #5a665d;
  margin-bottom: 6px;
  font-weight: 700;
`

const Lede = styled.p`
  font-size: 18px;
  color: #3d453f;
`

const Alert = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e7d9c5;
  background: #fff2ef;
  color: ${({theme}) => theme.colors.error};
  margin: 12px 0;
`

const InlineLoading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: #3d453f;
`

const LoaderDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({theme}) => theme.colors.berry};
  animation: pulse 1.2s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.12s;
  }
  &:nth-child(3) {
    animation-delay: 0.24s;
  }

  @keyframes pulse {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`

const EmptyState = styled.div`
  border: 1px dashed #d9c9b5;
  background: ${({theme}) => theme.colors.surfaceSoft};
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  margin: 12px 0 24px;
`

const RecipeGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
`

const RecipeCardContainer = styled(Link)<{
  accent: (typeof cardAccents)[number];
  $clickable?: boolean;
}>`
  background: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.radii.lg};
  border: 1px solid #e7d9c5;
  box-shadow: ${({theme}) => theme.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: grid;
  gap: 8px;
  padding: 18px;
  text-decoration: none;
  color: inherit;
  position: relative;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({theme}) => theme.radii.lg};
    border-left: 6px solid ${({accent}) => accentColors[accent]};
    pointer-events: none;
  }

  &:hover {
    transform: ${({$clickable}) => ($clickable ? 'translateY(-3px)' : 'none')};
    box-shadow: ${({theme}) => theme.shadows.cardHover};
    border-color: ${({theme}) => theme.colors.sage};
  }
`

const TagsInline = styled.div`
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
`

const Muted = styled.p`
  color: ${({theme}) => theme.colors.muted};
  margin: 0;
`

export default HomePage
