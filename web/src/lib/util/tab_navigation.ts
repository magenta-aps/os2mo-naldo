import { EmployeeTab, OrgTab } from "../stores/tab"

type TabEnum = typeof EmployeeTab | typeof OrgTab
type TabType = keyof typeof EmployeeTab | keyof typeof OrgTab

export const handleTabNavigation = (
  Tab: TabEnum,
  pageUrl: any
): { lookup: TabType; newUrl: string } => {
  // Retrieve the hash part of the URL (what comes after '#')
  const urlTab = pageUrl.hash

  // Remove '#' and convert to uppercase if there's a value
  const possibleLookup = urlTab ? urlTab.replace("#", "").toUpperCase() : null

  // Check if the possible lookup value exists in the Tab enum
  // If yes, use that value; otherwise, use the first key in the enum
  const lookup =
    possibleLookup && possibleLookup in Tab
      ? (possibleLookup as TabType)
      : (Object.keys(Tab)[0] as TabType)

  // Create the new URL by appending the found lookup value as a hash
  const newUrl = `${pageUrl.pathname}#${lookup.toLowerCase()}`

  return { lookup, newUrl }
}
