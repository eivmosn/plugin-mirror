import type {
  DecorationSet,
  ViewUpdate,
} from '@codemirror/view'
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view'

export function toKebab(input: string) {
  let output = ''
  for (let i = 0, char = ''; i < input.length; i++) {
    char = input.charAt(i)
    if (char >= 'A' && char <= 'Z')
      output += `-${char.toLowerCase()}`
    else
      output += char
  }
  return output
}

export class TagWidget extends WidgetType {
  text: string | undefined
  style: Record<string, string | number> | undefined
  constructor(text: string, style?: Record<string, string | number>) {
    super()
    if (text)
      this.text = text
    if (style)
      this.style = style
  }

  eq(widget: TagWidget) {
    return this.text === widget.text
  }

  toString(style: Record<string, string | number>) {
    return Object.entries(style).map(([k, v]) => `${toKebab(k)}:${v}`).join(';')
  }

  toDOM() {
    const span = document.createElement('span')
    if (!this.text)
      return span
    span.style.cssText = this.toString({
      border: '1px solid #91caff',
      borderRadius: '4px',
      lineHeight: '20px',
      background: '#e6f4ff',
      color: '#0958d9',
      fontSize: '12px',
      padding: '2px 7px',
      userSelect: 'none',
      ...this.style,
    })
    span.textContent = this.text
    return span
  }

  ignoreEvent() {
    return true
  }
}

export function tag(regexp?: RegExp, style?: Record<string, string | number>) {
  const tagMatcher = new MatchDecorator({
    regexp: regexp || /\$\{(.+?)\}/g,
    decoration: (match) => {
      return Decoration.replace({
        widget: new TagWidget(match[1], style),
      })
    },
  })

  return ViewPlugin.fromClass(
    class {
      tag: DecorationSet
      constructor(view: EditorView) {
        this.tag = tagMatcher.createDeco(view)
      }

      update(update: ViewUpdate) {
        this.tag = tagMatcher.updateDeco(
          update,
          this.tag,
        )
      }
    },
    {
      decorations: (instance: any) => {
        return instance.tag
      },
      provide: (plugin: any) =>
        EditorView.atomicRanges.of((view: any) => {
          return view.plugin(plugin)?.tag || Decoration.none
        }),
    },
  )
}
