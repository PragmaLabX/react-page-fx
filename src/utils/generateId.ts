let counter = 0

export function generateId(prefix = 'screen'): string {
  return `${prefix}_${++counter}`
}

/** Only for tests — resets the counter so IDs are predictable */
export function resetIdCounter(): void {
  counter = 0
}
