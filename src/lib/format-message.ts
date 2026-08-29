function readBalanced(template: string, start: number) {
  let depth = 0
  for (let index = start; index < template.length; index += 1) {
    const char = template[index]
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return { end: index, inner: template.slice(start + 1, index) }
      }
    }
  }
  return { end: template.length - 1, inner: template.slice(start + 1) }
}

function interpolateToken(
  token: string,
  values: Record<string, string | number>,
): string {
  const comma = token.indexOf(',')
  if (comma === -1) {
    const value = values[token.trim()]
    return value == null ? `{${token}}` : String(value)
  }

  const name = token.slice(0, comma).trim()
  const rest = token.slice(comma + 1).trim()
  const value = values[name]
  if (!rest.startsWith('plural')) {
    return value == null ? `{${token}}` : String(value)
  }

  const amount = Number(value)
  const oneMatch = rest.match(/=1\s*\{([^{}]*)\}/)
  const otherMatch = rest.match(/other\s*\{([^{}]*)\}/)
  const chosen = amount === 1 ? oneMatch?.[1] : otherMatch?.[1]
  if (chosen == null) {
    return String(value ?? '')
  }
  return chosen.replace('#', String(amount))
}

export function formatMessage(
  template: string,
  values: Record<string, string | number> = {},
) {
  let index = 0
  let output = ''
  while (index < template.length) {
    const start = template.indexOf('{', index)
    if (start === -1) {
      output += template.slice(index)
      break
    }
    output += template.slice(index, start)
    const { end, inner } = readBalanced(template, start)
    output += interpolateToken(inner, values)
    index = end + 1
  }
  return output
}
