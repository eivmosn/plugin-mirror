import { completionPath, javascriptLanguage } from '@codemirror/lang-javascript'
import type { Extension } from '@codemirror/state'
import type { CompletionContext } from '@codemirror/autocomplete'
import type { MaybeObject } from '@eivmosn/utils'
import { objectKeys } from '@eivmosn/utils'
import { EditorView } from '@codemirror/view'

const Identifier = /^[\w$\xA1-\uFFFF][\w$\d\xA1-\uFFFF]*$/
const VueIdentifier = /^__\w+__$/
const PrototypeIdentifier = /(propertyIsEnumerable|valueOf|constructor|hasOwnProperty|isPrototypeOf|toString|toLocaleString)/

const Icons = {
  function: 'ƒ',
  method: 'ƒ',
  class: '○',
  interface: '◌',
  variable: 'x',
  constant: 'C',
  type: 't',
  enum: 'U',
  property: '□',
  keyword: '🔑',
  namespace: '▢',
}

function enumeratePropertyCompletions(obj: MaybeObject, top: boolean) {
  const options = []
  const seen = new Set()
  for (let depth = 0; ; depth++) {
    for (const name of (Object.getOwnPropertyNames || Object.keys)(obj)) {
      if (VueIdentifier.test(name) || PrototypeIdentifier.test(name))
        continue
      if (!/^[a-zA-Z_$\xAA-\uFFDC][\w$\xAA-\uFFDC]*$/.test(name) || seen.has(name))
        continue
      seen.add(name)
      let value
      try {
        value = obj[name]
      }
      catch (_) {
        continue
      }
      options.push({
        label: name,
        type: typeof value == 'function'
          ? (/^[A-Z]/.test(name) ? 'class' : top ? 'function' : 'method')
          : top ? 'variable' : 'property',
        boost: -depth,
      })
    }
    const next = Object.getPrototypeOf(obj)
    if (!next)
      return options
    obj = next
  }
}

function scopeCompletionSource(scope: MaybeObject) {
  const cache = new Map()
  return (context: CompletionContext) => {
    const path = completionPath(context)
    if (!path)
      return null
    let target = scope
    for (const step of path.path) {
      target = target[step]
      if (!target)
        return null
    }
    let options = cache.get(target)
    if (!options)
      cache.set(target, options = enumeratePropertyCompletions(target, !path.path.length))
    return {
      from: context.pos - path.name.length,
      options,
      validFor: Identifier,
    }
  }
}

function styles(icon?: Partial<typeof Icons>) {
  return Object.fromEntries(
    objectKeys(Icons).map(key => [
      `.cm-completionIcon-${key}`,
      {
        '&:after': {
          content: `'${icon?.[key] || Icons[key]}' !important`,
        },
      },
    ]),
  )
}

export function autocomplete(override?: Partial<{
  source: MaybeObject
  icon: Partial<typeof Icons>
}>): Extension {
  return [
    javascriptLanguage.data.of({
      autocomplete: scopeCompletionSource(Object.assign(globalThis, override?.source)),
    }),
    EditorView.baseTheme(styles(override?.icon)),
  ]
}
