// Should put logic from `orgTree.svelte` here

export type OrgTreeItem = {
  name: string
  uuid: string | undefined
  user_key: string | undefined
  has_children: boolean
  orgUnitHierarchyUuid?: string | null
  breadcrumbs?: string[]
  fromDate: string
}
