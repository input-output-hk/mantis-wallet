export const PROGRESS_FOR_DAG = [/Generating DAG (\d+)%/, /Loading DAG from file (\d+)%/] as const

export const FAILURE_FOR_DAG = [
  'DAG file ended unexpectedly',
  'Invalid DAG file prefix',
  'Cannot read DAG from file',
  'Cannot generate DAG file',
] as const

export const SUCCESS_FOR_DAG = [
  'DAG file loaded successfully',
  'DAG file generated successfully',
] as const
