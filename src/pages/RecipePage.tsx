import {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import styled from 'styled-components'
import {client, urlFor} from '../sanityClient'
import type {Recipe} from '../types/recipe'
import {formatTime, getDifficultyLabel} from '../utils/recipeFormatting'

const detailQuery = `*[_type == "recipe" && slug.current == $slug][0]{
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

const RecipePage = () => {
  const {slug} = useParams<{slug: string}>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!slug) {
        setError('Recipe not found')
        setLoading(false)
        return
      }

      try {
        const data = await client.fetch<Recipe | null>(detailQuery, {slug})
        if (!data) {
          setError('Recipe not found')
        } else {
          setRecipe(data)
        }
      } catch (err) {
        console.error(err)
        setError('We could not reach this recipe right now. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [slug])

  if (loading) {
    return (
      <Page>
        <TopBar>
          <BackLink to="/">← Back to recipes</BackLink>
        </TopBar>
        <Muted>Loading recipe…</Muted>
      </Page>
    )
  }

  if (error || !recipe) {
    return (
      <Page>
        <TopBar>
          <BackLink to="/">← Back to recipes</BackLink>
        </TopBar>
        <Alert>{error ?? 'Recipe not found'}</Alert>
      </Page>
    )
  }

  const heroUrl = urlFor(recipe.heroImage)?.width(1400).height(900).url()
  const difficulty = getDifficultyLabel(recipe.difficulty)

  return (
    <Page>
      <TopBar>
        <BackLink to="/">← Back to recipes</BackLink>
        {recipe.tags && recipe.tags.length > 0 ? (
          <TagRow>
            {recipe.tags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
          </TagRow>
        ) : null}
      </TopBar>

      <Hero>
        <HeroImageContainer>
        {heroUrl ? <HeroImage src={heroUrl} alt={recipe.title} /> : <HeroPlaceholder></HeroPlaceholder>}
        </HeroImageContainer>
        <HeroOverlay />
        <HeroContent>
          <Eyebrow>{recipe.familyMember ? `Shared by ${recipe.familyMember}` : 'Family recipe'}</Eyebrow>
          <Title>{recipe.title}</Title>
          <HeroLede>{recipe.shortDescription}</HeroLede>
          <MetaRow>
            <MetaItem>
              <Label>Time</Label>
              <strong>{formatTime(recipe.prepTime, recipe.cookTime)}</strong>
            </MetaItem>
            {recipe.servings &&
              <MetaItem>
                <Label>Servings</Label>
                <strong>{recipe.servings ?? '—'}</strong>
              </MetaItem>
            }
            <MetaItem>
              <Label>Difficulty</Label>
              <strong>{difficulty ?? '—'}</strong>
            </MetaItem>
          </MetaRow>
        </HeroContent>
      </Hero>

      <Content>
        <LeftColumn>
          <ScaleRow>
            <ScaleLabel>Scale recipe</ScaleLabel>
            <ScaleButtons>
              <ScaleButton type="button" $active={scale === 1} onClick={() => setScale(1)}>
                1×
              </ScaleButton>
              <ScaleButton type="button" $active={scale === 2} onClick={() => setScale(2)}>
                2×
              </ScaleButton>
              <ScaleButton type="button" $active={scale === 4} onClick={() => setScale(4)}>
                4×
              </ScaleButton>
              <ScaleButton type="button" $active={scale === 8} onClick={() => setScale(8)}>
                8×
              </ScaleButton>
            </ScaleButtons>
          </ScaleRow>

          <Section>
            <SectionHeading>Ingredients</SectionHeading>
            <List>
              {recipe.ingredients?.map((ingredient) => {
                const scaledQuantity = formatScaledQuantity(ingredient.quantity, scale)
                const parts = [scaledQuantity, ingredient.unit, ingredient.item].filter(Boolean)
                return (
                  <li key={ingredient._key}>
                    <span className="primary">{parts.join(' ')}</span>
                    {ingredient.note ? <span className="note">{ingredient.note}</span> : null}
                  </li>
                )
              })}
            </List>
          </Section>

          {recipe.tips ? (
            <TipBox>
              <SectionHeading>Family tips</SectionHeading>
              <p>{recipe.tips}</p>
            </TipBox>
          ) : null}
        </LeftColumn>

        <RightColumn>
          <Section>
            <SectionHeading>Instructions</SectionHeading>
            <Steps>
              {recipe.instructions?.map((step, index) => (
                <li key={`${recipe._id}-step-${index}`}>
                  <StepNumber>{index + 1}</StepNumber>
                  <span>{step}</span>
                </li>
              ))}
            </Steps>
          </Section>
        </RightColumn>
      </Content>
    </Page>
  )
}

const Page = styled.main`
  max-width: 1100px;
  margin: 0 auto 120px;
  padding: 32px 20px 64px;
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e7d9c5;
  background: ${({theme}) => theme.colors.surfaceSoft};
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
`

const TagRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Hero = styled.section`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e7d9c5;
  height: 320px;
  box-shadow: ${({theme}) => theme.shadows.card};
  margin-bottom: 20px;
`
const HeroImageContainer = styled.div`
height: 320px;
padding: 10px
`

const HeroImage = styled.img`
  width: auto;
  height: 300px;
  margin: auto 0px auto auto;
  display: block;
`

const HeroPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 320px;
  display: grid;
  place-items: center;
  background: ${({theme}) => theme.colors.surfaceSoft};
  color: ${({theme}) => theme.colors.muted};
  padding: 16px;
`

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({theme}) => theme.colors.sage};
`

const HeroContent = styled.div`
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 20px;
  color: #ffffff;
  display: grid;
  gap: 8px;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
`

const Eyebrow = styled.p`
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 12px;
  margin: 0;
  font-weight: 700;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  color: #ffffff;
`

const HeroLede = styled.p`
  margin: 0;
  font-size: 18px;
  max-width: 760px;
`

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 6px;
`

const MetaItem = styled.div`
  background: rgba(0, 0, 0, 0.35);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: grid;
  gap: 4px;
  min-width: 120px;
`

const Label = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #e9e4dc;
`

const Content = styled.section`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 18px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const LeftColumn = styled.div`
  display: grid;
  gap: 12px;
`

const RightColumn = styled.div`
  display: grid;
  gap: 12px;
`

const Section = styled.div`
  background: ${({theme}) => theme.colors.surface};
  border: 1px solid #e7d9c5;
  border-radius: 14px;
  padding: 16px;
  box-shadow: ${({theme}) => theme.shadows.card};
`

const SectionHeading = styled.h3`
  margin: 0 0 10px;
`

const ScaleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`

const ScaleLabel = styled.span`
  font-weight: 600;
`

const ScaleButtons = styled.div`
  display: inline-flex;
  gap: 8px;
`

const ScaleButton = styled.button<{$active: boolean}>`
  border: 1px solid ${({$active, theme}) => ($active ? theme.colors.berryStrong : '#e7d9c5')};
  background: ${({$active, theme}) => ($active ? theme.colors.berry : theme.colors.surfaceSoft)};
  color: ${({$active}) => ($active ? '#ffffff' : 'inherit')};
  padding: 8px 12px;
  border-radius: ${({theme}) => theme.radii.pill};
  cursor: pointer;
  font-weight: 600;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;

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
  padding-left: 0;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  counter-reset: step;

  li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: baseline;
    background: ${({theme}) => theme.colors.surfaceSoft};
    border: 1px solid #e7d9c5;
    border-radius: 12px;
    padding: 12px;
  }
`

const StepNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({theme}) => theme.colors.berry};
  color: #ffffff;
  font-weight: 700;
`

const TipBox = styled.div`
  border-radius: ${({theme}) => theme.radii.sm};
  background: #fff8ed;
  padding: 12px;
  border: 1px solid #ecdcc6;
`

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${({theme}) => theme.radii.pill};
  background: rgba(31, 38, 34, 0.08);
  font-size: 12px;
  font-weight: 600;
`

const Muted = styled.p`
  color: ${({theme}) => theme.colors.muted};
  margin: 4px 0 10px;
`

const Alert = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e7d9c5;
  background: #fff2ef;
  color: ${({theme}) => theme.colors.error};
  margin: 12px 0;
`

export default RecipePage

const formatScaledQuantity = (raw?: string, scale = 1) => {
  if (!raw || scale === 1) return raw ?? ''
  const parsed = parseQuantity(raw)
  if (parsed == null) return `${raw} (x${scale})`
  const scaled = parsed * scale
  return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2).replace(/\.?0+$/, '')
}

const parseQuantity = (raw?: string): number | null => {
  if (!raw) return null
  const text = raw.trim()
  if (!text) return null

  // handle mixed numbers like "1 1/2"
  const parts = text.split(' ')
  let total = 0
  for (const part of parts) {
    const value = fractionToNumber(part)
    if (value == null) return null
    total += value
  }
  return total
}

const fractionToNumber = (value: string): number | null => {
  if (!value) return null
  if (value.includes('/')) {
    const [num, den] = value.split('/')
    const n = Number(num)
    const d = Number(den)
    if (Number.isFinite(n) && Number.isFinite(d) && d !== 0) return n / d
    return null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
