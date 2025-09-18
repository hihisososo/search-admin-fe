export const formatChartDate = (value: string) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}