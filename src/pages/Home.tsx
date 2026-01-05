import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {client, urlFor} from '../sanityClient'
import type {Recipe} from '../types/recipe'
import {formatTime, getDifficultyLabel} from '../utils/recipeFormatting'

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

const emptySteps = ['Add steps to teach the rest of us how to make this one!']

const HomePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const data = await client.fetch<Recipe[]>(recipeQuery)
        console.log(data)
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
            Browse every treasured recipe from the family box. Search, filter, and open the steps
            without leaving this page.
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
              {loading ? 'Loading…' : `${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? '' : 's'}`}
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
              expanded={expandedId === recipe._id}
              onToggle={() => setExpandedId(expandedId === recipe._id ? null : recipe._id)}
            />
          ))}
        </RecipeGrid>
      )}

      {/* {spotlightRecipe && !loading && (
        <Spotlight>
          <div>
            <Eyebrow>Spotlight</Eyebrow>
            <h2>{spotlightRecipe.title}</h2>
            <Lede>
              {spotlightRecipe.shortDescription ||
                'Open this recipe to see the ingredient list and numbered steps.'}
            </Lede>
            <MetaRow>
              <span>{formatTime(spotlightRecipe.prepTime, spotlightRecipe.cookTime)} total</span>
              {spotlightRecipe.servings ? <span>{spotlightRecipe.servings} servings</span> : null}
              {spotlightRecipe.familyMember ? (
                <span>Shared by {spotlightRecipe.familyMember}</span>
              ) : null}
            </MetaRow>
            <Button
              type="button"
              $variant="ghost"
              onClick={() =>
                setExpandedId(expandedId === spotlightRecipe._id ? null : spotlightRecipe._id)
              }
            >
              {expandedId === spotlightRecipe._id ? 'Hide steps' : 'Open steps'}
            </Button>
          </div>
          <SpotlightImageWrapper>
            <SpotlightImage recipe={spotlightRecipe} />
          </SpotlightImageWrapper>
        </Spotlight>
      )} */}
    </Page>
  )
}

type CardProps = {
  recipe: Recipe
  accent: (typeof cardAccents)[number]
  expanded: boolean
  onToggle: () => void
}

const RecipeCard = ({recipe, accent, expanded, onToggle}: CardProps) => {
  const image = urlFor(recipe.heroImage)?.width(800).height(560).url()
  const ingredients = recipe.ingredients ?? []
  const steps = recipe.instructions?.length ? recipe.instructions : emptySteps
  const difficulty = getDifficultyLabel(recipe.difficulty)
  const slug = recipe.slug?.current
  const background = image
    ? `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.35)), url(${image})`
    : undefined

  return (
    <RecipeCardContainer accent={accent} $expanded={expanded}>
      <RecipeMedia accent={accent} $background={background}>
        <MediaTop>
          {difficulty ? <Pill $muted>{difficulty}</Pill> : null}
          {recipe.tags && recipe.tags.length > 0 ? (
            <TagsInline>
              {recipe.tags.slice(0, 2).map((tag) => (
                <Pill key={tag} $ghost>
                  {tag}
                </Pill>
              ))}
              {recipe.tags.length > 2 ? <Pill $ghost>+{recipe.tags.length - 2}</Pill> : null}
            </TagsInline>
          ) : null}
        </MediaTop>
        <MediaMeta>
          <span>{formatTime(recipe.prepTime, recipe.cookTime)}</span>
          {recipe.servings ? <span>{recipe.servings} servings</span> : null}
        </MediaMeta>
      </RecipeMedia>

      <RecipeCardBody>
        <Eyebrow>{recipe.familyMember ? `Shared by ${recipe.familyMember}` : 'Family recipe'}</Eyebrow>
        <h3>{recipe.title}</h3>
        <Muted>{recipe.shortDescription || 'No description yet.'}</Muted>
        <CardActions>
          <Button type="button" $variant="ghost" onClick={onToggle}>
            {expanded ? 'Hide steps' : 'View steps'}
          </Button>
          {slug ? (
            <Button as={Link} to={`/recipes/${slug}`} $variant="text">
              View full recipe
            </Button>
          ) : null}
        </CardActions>

        {expanded && (
          <CardDetails>
            <div>
              <SectionHeading>Ingredients</SectionHeading>
              <List>
                {ingredients.map((ingredient) => {
                  const parts = [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean)
                  return (
                    <li key={ingredient._key}>
                      <span className="primary">{parts.join(' ')}</span>
                      {ingredient.note ? <span className="note">{ingredient.note}</span> : null}
                    </li>
                  )
                })}
              </List>
            </div>
            <div>
              <SectionHeading>Steps</SectionHeading>
              <Steps>
                {steps.map((step, index) => (
                  <li key={`${recipe._id}-step-${index}`}>{step}</li>
                ))}
              </Steps>
            </div>
            {recipe.tips ? (
              <Tips>
                <SectionHeading>Family tips</SectionHeading>
                <p>{recipe.tips}</p>
              </Tips>
            ) : null}
          </CardDetails>
        )}
      </RecipeCardBody>
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
  font-size: 12px;
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

const RecipeCardContainer = styled.article<{
  accent: (typeof cardAccents)[number]
  $expanded: boolean
}>`
  background: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({$expanded, theme}) => ($expanded ? theme.colors.sage : '#e7d9c5')};
  box-shadow: ${({theme}) => theme.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({theme}) => theme.shadows.cardHover};
  }
`

const RecipeMedia = styled.div<{accent: (typeof cardAccents)[number]; $background?: string}>`
  min-height: 160px;
  background: ${({$background, accent}) => $background || accentColors[accent]};
  background-size: cover;
  background-position: center;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #ffffff;
`

const MediaTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`

const TagsInline = styled.div`
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const MediaMeta = styled.div`
  display: inline-flex;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.28);
  padding: 8px 10px;
  border-radius: ${({theme}) => theme.radii.sm};
  width: fit-content;
`

const RecipeCardBody = styled.div`
  padding: 18px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Muted = styled.p`
  color: ${({theme}) => theme.colors.muted};
  margin: 0;
`

const CardActions = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const CardDetails = styled.div`
  border-top: 1px solid #e7d9c5;
  padding-top: 12px;
  display: grid;
  gap: 12px;
`

const SectionHeading = styled.h4`
  margin: 0 0 8px;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;

  li {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .primary {
    font-weight: 600;
  }
  .note {
    color: ${({theme}) => theme.colors.muted};
    font-size: 14px;
  }
`

const Steps = styled.ol`
  padding-left: 20px;
  margin: 0;
  display: grid;
  gap: 8px;
`

const Tips = styled.div`
  border-radius: ${({theme}) => theme.radii.sm};
  background: #fff8ed;
  padding: 12px;
  border: 1px solid #ecdcc6;
`

const Spotlight = styled.section`
  margin-top: 48px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  align-items: center;
  border-radius: 20px;
  border: 1px solid #e7d9c5;
  padding: 18px;
  background: ${({theme}) => theme.colors.surface};
  box-shadow: ${({theme}) => theme.shadows.card};
`

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  color: ${({theme}) => theme.colors.muted};
`

const SpotlightImageWrapper = styled.div`
  width: 100%;
  background: radial-gradient(circle at 20% 20%, rgba(166, 61, 64, 0.12), transparent 40%),
    ${({theme}) => theme.colors.surfaceSoft};
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #e7d9c5;
  display: flex;
  justify-content: center;
`

const SpotlightPhoto = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  max-height: 380px;
`

const SpotlightPlaceholder = styled.div`
  width: 100%;
  min-height: 180px;
  border-radius: 12px;
  border: 1px dashed #d9c9b5;
  color: ${({theme}) => theme.colors.muted};
  display: grid;
  place-items: center;
  text-align: center;
  padding: 16px;
`

export default HomePage
