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

const RecipeDetailPage = () => {
  const {slug} = useParams<{slug: string}>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError('We could not reach the recipe right now. Please try again.')
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
          <BackButton as={Link} to="/">
            ← Back to recipes
          </BackButton>
        </TopBar>
        <Muted>Loading recipe…</Muted>
      </Page>
    )
  }

  if (error || !recipe) {
    return (
      <Page>
        <TopBar>
          <BackButton as={Link} to="/">
            ← Back to recipes
          </BackButton>
        </TopBar>
        <Alert>{error ?? 'Recipe not found'}</Alert>
      </Page>
    )
  }

  const image = urlFor(recipe.heroImage)?.width(1100).height(720).url()
  const difficulty = getDifficultyLabel(recipe.difficulty)

  return (
    <Page>
      <TopBar>
        <BackButton as={Link} to="/">
          ← Back to recipes
        </BackButton>
        {recipe.tags && recipe.tags.length > 0 ? (
          <TagRow>
            {recipe.tags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
          </TagRow>
        ) : null}
      </TopBar>

      <Header>
        <div>
          <Eyebrow>{recipe.familyMember ? `Shared by ${recipe.familyMember}` : 'Family recipe'}</Eyebrow>
          <h1>{recipe.title}</h1>
          <Muted>{recipe.shortDescription}</Muted>
          <MetaRow>
            <span>{formatTime(recipe.prepTime, recipe.cookTime)} total</span>
            {recipe.servings ? <span>{recipe.servings} servings</span> : null}
            {difficulty ? <span>{difficulty}</span> : null}
          </MetaRow>
        </div>
        <InfoTiles>
          <Tile>
            <Label>Prep</Label>
            <strong>{recipe.prepTime ? `${recipe.prepTime} min` : '—'}</strong>
          </Tile>
          <Tile>
            <Label>Cook</Label>
            <strong>{recipe.cookTime ? `${recipe.cookTime} min` : '—'}</strong>
          </Tile>
          <Tile>
            <Label>Servings</Label>
            <strong>{recipe.servings ?? '—'}</strong>
          </Tile>
        </InfoTiles>
      </Header>

      <Content>
        <ImagePanel>
          {image ? <HeroImage src={image} alt={recipe.title} /> : <Placeholder>Add a photo to feature it here.</Placeholder>}
        </ImagePanel>

        <DetailsPanel>
          <Section>
            <SectionHeading>Ingredients</SectionHeading>
            <List>
              {recipe.ingredients?.map((ingredient) => {
                const parts = [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean)
                return (
                  <li key={ingredient._key}>
                    <span className="primary">{parts.join(' ')}</span>
                    {ingredient.note ? <span className="note">{ingredient.note}</span> : null}
                  </li>
                )
              })}
            </List>
          </Section>

          <Section>
            <SectionHeading>Steps</SectionHeading>
            <Steps>
              {recipe.instructions?.map((step, index) => (
                <li key={`${recipe._id}-step-${index}`}>{step}</li>
              ))}
            </Steps>
          </Section>

          {recipe.tips ? (
            <TipBox>
              <SectionHeading>Family tips</SectionHeading>
              <p>{recipe.tips}</p>
            </TipBox>
          ) : null}
        </DetailsPanel>
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
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e7d9c5;
  background: ${({theme}) => theme.colors.surfaceSoft};
  cursor: pointer;
  font-weight: 600;
`

const TagRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Header = styled.header`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  background: ${({theme}) => theme.colors.surface};
  border: 1px solid #e7d9c5;
  border-radius: 18px;
  padding: 18px;
  box-shadow: ${({theme}) => theme.shadows.card};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Eyebrow = styled.p`
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 12px;
  color: #5a665d;
  margin: 0 0 6px;
  font-weight: 700;
`

const Muted = styled.p`
  color: ${({theme}) => theme.colors.muted};
  margin: 4px 0 10px;
`

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  color: ${({theme}) => theme.colors.muted};
`

const InfoTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  align-self: center;
`

const Tile = styled.div`
  background: ${({theme}) => theme.colors.surfaceSoft};
  border: 1px solid #e7d9c5;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  strong {
    font-size: 18px;
  }
`

const Label = styled.div`
  color: ${({theme}) => theme.colors.muted};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const Content = styled.section`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 18px;
  margin-top: 22px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const ImagePanel = styled.div`
  background: radial-gradient(circle at 20% 20%, rgba(166, 61, 64, 0.12), transparent 40%),
    ${({theme}) => theme.colors.surfaceSoft};
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #e7d9c5;
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeroImage = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  max-height: 520px;
`

const Placeholder = styled.div`
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

const DetailsPanel = styled.div`
  background: ${({theme}) => theme.colors.surface};
  border: 1px solid #e7d9c5;
  border-radius: 16px;
  padding: 16px;
  box-shadow: ${({theme}) => theme.shadows.card};
  display: grid;
  gap: 12px;
`

const Section = styled.div`
  display: grid;
  gap: 10px;
`

const SectionHeading = styled.h3`
  margin: 0;
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
  padding-left: 20px;
  margin: 0;
  display: grid;
  gap: 8px;
`

const TipBox = styled.div`
  border-radius: ${({theme}) => theme.radii.sm};
  background: #fff8ed;
  padding: 12px;
  border: 1px solid #ecdcc6;
`

const Alert = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e7d9c5;
  background: #fff2ef;
  color: ${({theme}) => theme.colors.error};
  margin: 12px 0;
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

export default RecipeDetailPage
