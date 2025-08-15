export const tenseToValidity = (
  tense: Tense,
  date: string
): { fromDate: string | null; toDate: string | null } | {} => {
  switch (tense) {
    case "past":
      return { fromDate: null, toDate: date }
    case "present":
      return { fromDate: date }
    case "future":
      return { fromDate: date, toDate: null }
  }
}

export const filterTenseToValidity = (
  tense: Tense,
  date: string
): { from_date: string | null; to_date: string | null } | {} => {
  switch (tense) {
    case "past":
      return { from_date: null, to_date: date }
    case "present":
      return { from_date: date }
    case "future":
      return { from_date: date, to_date: null }
  }
}

export const tenseFilter = (
  obj: { validity: Validity | OpenValidity },
  tense: Tense
) => {
  const globalDate = get(date)
  switch (tense) {
    case "past":
      return globalDate > obj.validity.to?.split("T")[0]
    case "present":
      return true
    case "future":
      return globalDate < obj.validity.from?.split("T")[0]
  }
}
