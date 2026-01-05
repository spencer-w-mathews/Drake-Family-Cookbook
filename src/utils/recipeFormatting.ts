export const formatTime = (prep?: number, cook?: number) => {
  const total = (prep ?? 0) + (cook ?? 0)
  if (!total) return 'Time varies'
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

const difficultyLabel: Record<string, string> = {
  easy: 'Easy',
  weeknight: 'Weeknight-friendly',
  showstopper: 'Showstopper',
}

export const getDifficultyLabel = (value?: string | null) =>
  value ? difficultyLabel[value] ?? value : null
