export function html(strings: TemplateStringsArray, ...values: unknown[]) {
  return strings.reduce((p, c, i) => {
    return p + (values[i - 1] ?? '') + c
  })
}

export function dom(html: string, type: 'image/svg+xml'): SVGElement
export function dom(html: string, type: 'text/html'): HTMLElement
export function dom(html: string, type: 'image/svg+xml' | 'text/html') {
  const parser = new DOMParser()
  const parsed = parser.parseFromString(html, type)
  return type === 'text/html' ? (parsed.body.firstChild as Element) : parsed
}
