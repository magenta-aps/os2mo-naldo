export const paginateQuery = async (
  query: string,
  variableValues: Record<string, any> = {},
  pageSize: number,
  onProgress: (count: number) => void = () => {},
  abortSignal?: AbortSignal,
  maxRetries: number = 30
): Promise<any[]> => {
  let nextCursor = null
  const results: any[] = []
  let requestCount = 0

  try {
    while (true) {
      if (abortSignal?.aborted) {
        break
      }

      requestCount++
      onProgress(requestCount)

      const variables = {
        ...variableValues,
        limit: pageSize,
        cursor: nextCursor,
      }

      for (let attempts = 0; attempts <= maxRetries; attempts++) {
        try {
          const result: any = await graphQLClient().request(query, variables)

          // Add results to the array
          for (const obj of result.page.objects) {
            results.push(obj)
          }
          nextCursor = result.page["page_info"]["next_cursor"]
          break
        } catch (error: any) {
          console.error("Error encountered during request:", error)
          const errorMessage = error?.response?.errors?.[0]?.message || error.message

          if (
            errorMessage &&
            errorMessage.toLowerCase().includes("signature has expired")
          ) {
            console.warn(
              `Retrying request (${
                attempts + 1
              }/${maxRetries}) due to signature expiration.`
            )
            // 1-second delay on retry
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            console.error("Failed after retries or non-retryable error:", error)
            throw error
          }
        }
      }

      if (!nextCursor) break // Exit if no more pages
    }
  } catch (error) {
    console.error("Error during pagination:", error)
    throw error
  }

  return results
}
