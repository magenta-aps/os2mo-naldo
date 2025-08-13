export interface TimelineItem {
  id: number
  group: string
  content: string
  start: string
  end?: string
}

export interface TimelineGroup {
  id: string
  content: string
  nestedGroups?: string[]
  showNested?: boolean
  className?: string
}
