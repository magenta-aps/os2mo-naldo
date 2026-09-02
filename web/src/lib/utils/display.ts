type ITUserITSystemName = {
  uuid: string
  user_key?: string
  itsystem_response?: {
    uuid: string
    current?: {
      name: string
    } | null
  }
}

export const getITUserITSystemName = (itusers: ITUserITSystemName[]) => {
  return itusers.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem_response?.current?.name}, ${ituser.user_key}`,
    itsystem: { uuid: ituser.itsystem_response?.uuid },
  }))
}

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
export type EngagementTitleAndUuid = {
  uuid: string
  job_function_response?: { current?: { name: string } | null }
  org_unit_response?: { current?: { name: string } | null }
}

export const getEngagementTitlesAndUuid = (engagements: EngagementTitleAndUuid[]) => {
  return engagements.map((engagement) => ({
    uuid: engagement.uuid,
    name: `${engagement.job_function_response?.current?.name}, ${engagement.org_unit_response?.current?.name}`,
  }))
}

// Manager table's "Engagement" column. In SD-code mode job_function is just a
// code, so extension_1 stands in for it as the job title.
export type ManagerEngagement = {
  extension_1?: string | null
  org_unit_response?: { current?: { name: string } | null }
  job_function_response?: { current?: { name: string; user_key: string } | null }
}

export const getManagerEngagementDisplay = (
  engagement: ManagerEngagement,
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
  return [jobTitle, engagement.org_unit_response?.current?.name]
    .filter(Boolean)
    .join(", ")
}

export type KleNumberTitleAndUuid = {
  uuid: string
  name: string
  user_key: string
}

export const getKleNumberTitleAndUuid = (kles: KleNumberTitleAndUuid[]) => {
  const KleNumbers = kles.map((kle) => ({
    uuid: kle.uuid,
    name: `${kle.user_key} - ${kle.name}`,
  }))
  return KleNumbers.sort((a, b) => (a.name > b.name ? 1 : -1))
}

type ITSystem = {
  current?: {
    uuid: string
    name: string
  } | null
}

export const getITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems
    .filter((itsystem) => itsystem.current && itsystem.current !== null)
    .map((itsystem) => ({
      uuid: itsystem.current!.uuid,
      name: itsystem.current!.name,
    }))
  return ITSystems.sort((a, b) => (a.name > b.name ? 1 : -1))
}
