// Fields and types that are common to all 
export interface CommonActionSerializedFields {
  caster?: string,
  target?: string,
  using?: string,
  tags?: string[],
  breadcrumbs: string[],
  permitted: boolean
}

export interface SensoryInformation {
  [key: string]: any;
}