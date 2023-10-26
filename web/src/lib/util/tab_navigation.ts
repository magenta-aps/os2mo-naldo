import type { EmployeeTab, OrgTab } from "$lib/stores/tab"

type TabEnum = typeof EmployeeTab | typeof OrgTab
type TabType = keyof typeof EmployeeTab | keyof typeof OrgTab

/* export function handleTabNavigation(
  Tab: TabEnum,
  pageUrl: any
): { lookup: TabType; newUrl: string } {
const savedTab = localStorage.getItem("currentTab") 
  const urlTab = pageUrl.hash
  let lookup: TabType | null = null

  if (savedTab === undefined || savedTab === null) {
    if (urlTab) {
      const possibleLookup = urlTab.replace("#", "").toUpperCase()
      if (possibleLookup in Tab) {
        lookup = possibleLookup as TabType
      }
    }
  } else {
    const possibleLookup = savedTab.toUpperCase()
    if (possibleLookup in Tab) {
      lookup = possibleLookup as TabType
    }
  }

  if (lookup === null) {
    lookup = Object.keys(Tab)[0] as TabType
  }

  const newUrl = `${pageUrl.pathname}#${lookup.toLowerCase()}`

  return { lookup, newUrl }
} */

export function handleTabNavigation(
  Tab: TabEnum,
  pageUrl: any
): { lookup: TabType; newUrl: string } {
  const urlTab = pageUrl.hash
  let lookup: TabType | null = null

  if (urlTab) {
    const possibleLookup = urlTab.replace("#", "").toUpperCase()
    if (possibleLookup in Tab) {
      lookup = possibleLookup as TabType
    }
  }

  if (lookup === null) {
    lookup = Object.keys(Tab)[0] as TabType
  }

  const newUrl = `${pageUrl.pathname}#${lookup.toLowerCase()}`
  return { lookup, newUrl }
}
