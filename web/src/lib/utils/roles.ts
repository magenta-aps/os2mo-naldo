export type RoleITSystem = {
  uuid: string
  current?: { name: string } | null
} | null

export type Role = {
  it_system_response?: RoleITSystem
}

export type RoleGroup<T> = {
  itSystem: { uuid: string; name: string } | null
  roles: T[]
}

export const groupRolesByITSystem = <T extends Role>(
  roles: T[],
  locale: string = "da"
): RoleGroup<T>[] => {
  const groups = new Map<string | null, RoleGroup<T>>()

  for (const role of roles) {
    const itSystem = role.it_system_response ?? null
    const key = itSystem ? itSystem.uuid : null
    let group = groups.get(key)
    if (!group) {
      group = {
        itSystem: itSystem && {
          uuid: itSystem.uuid,
          name: itSystem.current?.name ?? itSystem.uuid,
        },
        roles: [],
      }
      groups.set(key, group)
    }
    group.roles.push(role)
  }

  return [...groups.values()].sort((a, b) => {
    if (!a.itSystem) return 1
    if (!b.itSystem) return -1
    return a.itSystem.name.localeCompare(b.itSystem.name, locale, {
      sensitivity: "base", // Æ/æ = æ, case-insensitive
    })
  })
}
