let lastCalledAt: number | null = null

export const debounce = async (
  func: (...args: any[]) => Promise<any>,
  ...args: any[]
): Promise<void> => {
  const now = Date.now()

  return new Promise<void>((resolve) => {
    if (!lastCalledAt || now - lastCalledAt >= 1000) {
      lastCalledAt = now
      resolve(func(...args))
    }
  })
}
