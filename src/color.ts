import type {
  DecorationSet,
  EditorView,
  ViewUpdate,
} from '@codemirror/view'
import {
  Decoration,
  MatchDecorator,
  ViewPlugin,
} from '@codemirror/view'

export interface KeywordDecoration {
  key: string
  color: string
}

export function color(keywords: KeywordDecoration[] | string[], defaultColor: string = 'rgb(8,0,255)') {
  const words = keywords.map((keyword) => {
    if (typeof keyword === 'string')
      return keyword
    return keyword.key
  })

  const getColor = (text: string) => {
    let result: string = ''
    for (let i = 0; i < keywords.length; i++) {
      const word = keywords[i]
      if (typeof word !== 'string' && word.key === text)
        result = word.color
      else
        result = defaultColor
    }
    return result
  }

  const regexp = new RegExp(words.join('|'), 'g')

  const keywordsMatcher = new MatchDecorator({
    regexp,
    decoration: (match) => {
      const [matchText] = match
      if (matchText) {
        const textColor = getColor(matchText)
        return Decoration.mark({
          attributes: {
            style: `color: ${textColor || defaultColor}`,
          },
        })
      }
      return Decoration.mark({})
    },
  })

  return ViewPlugin.fromClass(
    class {
      keywords: DecorationSet
      constructor(view: EditorView) {
        this.keywords = keywordsMatcher.createDeco(view)
      }

      update(update: ViewUpdate) {
        this.keywords = keywordsMatcher.updateDeco(
          update,
          this.keywords,
        )
      }
    },
    {
      decorations: (instance: any) => {
        return instance.keywords
      },
    },
  )
}
