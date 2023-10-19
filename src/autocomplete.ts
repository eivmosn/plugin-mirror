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
    return []

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
  const tree = syntaxTree(context.state)
  const treeNode = tree.resolveInner(context.pos, -1).node
  // console.log(item, treeNode.name, )
  const expression = treeNode.parent?.getChild('Expression')
  const name = context.state.sliceDoc(expression?.from, expression?.to)
  console.log(name, expression?.name)
  console.log(item)
  // const text = context.state.doc.toString()
  // console.log(Parser.parse(text, { ecmaVersion: 2020, sourceType: 'module' }))
  // console.log(item)

  // node.name === 'VariableName'
  // console.log(item);
  // if (node.name === '.') {
  //   console.log(item)
  //   console.log(node.parent?.name)
  //   const obj = node.toTree()
  //   console.log(obj)
  // }

  // const before = word.text[word.to - 2]
  // const current = word.text[word.to - 1]
  // if ((before && before !== '.') && current === '.') {
  //   const matcher = word.text.match(/([^.]*)\.$/)
  //   if (matcher) {
  //     const lastSegment = matcher[1]
  //     console.log(getAllKeys(item, lastSegment))
  //   }
  //   return {
  //     from: context.pos,
  //     options: [
  //       {
  //         label: 'ttt',
  //         type: 'variable',
  //       },
  //     ],
  //   }
  // }

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
