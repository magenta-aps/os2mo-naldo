export function toUrlFriendly(str: string): string {
    return str
        .toLowerCase()
        .replace(/æ/g, "ae")
        .replace(/ø/g, "oe")
        .replace(/å/g, "aa")
        .replace(/[^a-z0-9_\-]/g, "")  // accept "-"
        .replace(/\s+/g, "_");  // replace space with underscore
}

export function fromUrlFriendly(urlString: string, tabNames: string[]): string {
    const str = urlString.replace(/_/g, " ").replace("#", "");
    for (let tab of tabNames) {
        if (toUrlFriendly(tab).toLowerCase() === str.toLowerCase()) return tab;
    }
    return "";
}

export function getHash(): string {
    return window.location.hash.replace("#", "");
}

export function setHash(value: string): void {
    window.location.hash = value;
}

export function addUrlChangeListener(listener: () => void) {
    window.addEventListener('popstate', listener);

    return () => {
        window.removeEventListener('popstate', listener);
    };
}
