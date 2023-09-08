type ITUserITSystemName = {
  uuid: string
  user_key: string
  itsystem: { name: string }
}

export const getITUserITSystemName = (itusers: ITUserITSystemName[]) => {
  return itusers.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem.name}, ${ituser.user_key}`,
  }))
}

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
type EngagementTitleAndUuid = {
  uuid: string
  job_function: { name: string }
  org_unit: { name: string }[]
}
export const getEngagementTitlesAndUuid = (
  engagements: EngagementTitleAndUuid[]
): { uuid: string; name: string }[] => {
  return engagements.map((engagement) => {
    return {
      uuid: engagement.uuid,
      name: `${engagement.job_function.name}, ${engagement.org_unit[0].name}`,
    }
  })
}

type ITSystem = {
  objects: {
    uuid: string
    name: string
  }[]
}

export const getITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems.map((itsystem) => ({
    uuid: itsystem.objects[0].uuid,
    name: itsystem.objects[0].name,
  }))
  return ITSystems.sort((a, b) => (a.name > b.name ? 1 : -1))
}
