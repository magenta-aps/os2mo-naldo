// An engagement rendered as one line of text, for the tables that show it as a
// relation. In SD-code mode job_function is just a code, so extension_1 stands
// in for it as the job title.
export type EngagementDisplay = {
  extension_1?: string | null
  job_function_response?: { current?: { name: string; user_key: string } | null }
}

// `orgUnitName` is the caller's to resolve: a row referencing an engagement
// needs the unit's name during that engagement, not its name today.
export const getEngagementDisplay = (
  engagement: EngagementDisplay,
  orgUnitName: string | null | undefined,
  showJobFunctionUserKey: boolean,
  showExtension1: boolean
) => {
  const jobFunction = engagement.job_function_response?.current
  const jobTitle = !showJobFunctionUserKey
    ? jobFunction?.name
    : showExtension1 && engagement.extension_1
    ? engagement.extension_1
    : jobFunction && `${jobFunction.user_key} - ${jobFunction.name}`
  // Either half can be absent on a partially resolved engagement.
  return [jobTitle, orgUnitName].filter(Boolean).join(", ")
}
