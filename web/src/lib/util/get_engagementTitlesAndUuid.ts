// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
export type EngagementTitleAndUuid = {
  uuid: string
  job_function: { name: string }
  org_unit: { name: string }[]
}

export const getEngagementTitlesAndUuid = (
  engagements: EngagementTitleAndUuid[]
): { uuid: string; name: string }[] => {
  return engagements.map((engagement) => {
    if (engagement.org_unit.length === 0) {
      throw new Error(
        `Engagement with UUID: ${engagement.uuid} does not have any org_unit.`
      )
    }

    return {
      uuid: engagement.uuid,
      name: `${engagement.job_function.name}, ${engagement.org_unit[0].name}`,
    }
  })
}
