export const formatDate = (date: string): string => {
  const dt = new Date(date).toLocaleDateString("da-DK", {
    dateStyle: "short",
  })

  return dt.split(".").join("-")
}
