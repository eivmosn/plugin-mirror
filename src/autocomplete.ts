import type {
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete'
import {
  autocompletion,
} from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

export type CompletionItem = Record<string, unknown>

export function getAllKeys(obj: any, key: string): any {
  if (!obj || typeof obj !== 'object')
    return [] // 如果对象为空或不是对象，返回空数组

  const keys = []

  if (obj[key] && typeof obj[key] === 'object') {
    for (const subKey in obj[key])
      keys.push({ label: subKey, type: 'variable' })
  }

  for (const subKey in obj) {
    if (typeof obj[subKey] === 'object')
      keys.push(...getAllKeys(obj[subKey], key))
  }

  return keys
}

export function completion(context: CompletionContext, item: CompletionItem): CompletionResult | null {
  const word = context.matchBefore(/.*/)
  console.log(item)
  if (word) {
    const before = word.text[word.to - 2]
    const current = word.text[word.to - 1]
    if ((before && before !== '.') && current === '.') {
      const matcher = word.text.match(/([^.]*)\.$/)
      if (matcher) {
        const lastSegment = matcher[1]
        console.log(getAllKeys(item, lastSegment))
      }
      return {
        from: context.pos,
        options: [
          {
            label: 'ttt',
            type: 'variable',
          },
        ],
      }
    }
  }
  return null
}

export function autocomplete(item: CompletionItem = {}) {
  return autocompletion({
    override: [
      (context) => {
        return completion(context, item)
      },
    ],
  })
}

export const extension: Extension = [autocomplete()]
