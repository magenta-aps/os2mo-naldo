export const resetStores = (stores: any[] = []) => {
  stores.forEach((store) => {
    if (store && typeof store.reset === "function") {
      store.reset()
    }
  })
}
