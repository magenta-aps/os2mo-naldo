export function toUrlFriendly(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9_\-]+/g, "_") // accept "-" and replace invalid characters and spaces with underscore
}

export function fromUrlFriendly(urlString: string, tabNames: string[]): string {
  const cleanedUrlString = urlString.startsWith("#") ? urlString.slice(1) : urlString
  const str = cleanedUrlString.replace(/_/g, " ")
  console.log("Cleaned and converted string:", str)
  for (let tab of tabNames) {
    if (toUrlFriendly(tab).toLowerCase() === str) return tab
  }
  return ""
}

export function getHash(): string {
  return window.location.hash.slice(1)
}

export function setHash(value: string): void {
  window.location.hash = value
}

export function addUrlChangeListener(listener: () => void) {
  window.addEventListener("popstate", listener)
  return () => window.removeEventListener("popstate", listener)
}
