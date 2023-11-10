import { completionPath, javascriptLanguage } from '@codemirror/lang-javascript'
import type { Extension } from '@codemirror/state'
import type { CompletionContext } from '@codemirror/autocomplete'
import type { MaybeObject } from '@eivmosn/utils'
import { EditorView } from '@codemirror/view'

const Identifier = /^[\w$\xA1-\uFFFF][\w$\d\xA1-\uFFFF]*$/
const VueIdentifier = /^__\w+__$/
const PrototypeIdentifier = /(propertyIsEnumerable|valueOf|constructor|hasOwnProperty|isPrototypeOf|toString|toLocaleString)/

const IconSet = {
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

export function autocomplete(override?: Partial<{
  source: MaybeObject
  icon: Partial<typeof IconSet>
}>): Extension {
  return [
    javascriptLanguage.data.of({
      autocomplete: scopeCompletionSource(Object.assign(globalThis, override?.source)),
    }),
    EditorView.baseTheme({
      '.cm-completionIcon-function, .cm-completionIcon-method': {
        '&:after': { content: `'${override?.icon?.method || IconSet.method}' !important` },
      },
      '.cm-completionIcon-class': {
        '&:after': { content: `'${override?.icon?.class || IconSet.class}' !important` },
      },
      '.cm-completionIcon-interface': {
        '&:after': { content: `'${override?.icon?.interface || IconSet.interface}' !important` },
      },
      '.cm-completionIcon-variable': {
        '&:after': { content: `'${override?.icon?.variable || IconSet.variable}' !important` },
      },
      '.cm-completionIcon-constant': {
        '&:after': { content: `'${override?.icon?.constant || IconSet.constant}' !important` },
      },
      '.cm-completionIcon-type': {
        '&:after': { content: `'${override?.icon?.type || IconSet.type}' !important` },
      },
      '.cm-completionIcon-enum': {
        '&:after': { content: `'${override?.icon?.enum || IconSet.enum}' !important` },
      },
      '.cm-completionIcon-property': {
        '&:after': { content: `'${override?.icon?.property || IconSet.property}' !important` },
      },
      '.cm-completionIcon-keyword': {
        '&:after': { content: `'${override?.icon?.keyword || IconSet.keyword}' !important` },
      },
      '.cm-completionIcon-namespace': {
        '&:after': { content: `'${override?.icon?.namespace || IconSet.namespace}' !important` },
      },
    }),
  ]
}
