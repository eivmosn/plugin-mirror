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
import type * as CSS from 'csstype'

export class TagWidget extends WidgetType {
  text: string | undefined
  style: CSS.Properties | undefined
  constructor(text: string, style?: CSS.Properties) {
    super()
    if (text)
      this.text = text
    if (style)
      this.style = style
  }

  eq(widget: TagWidget) {
    return this.text === widget.text
  }

  defaultStyle(): CSS.Properties {
    return {
      border: '1px solid #91caff',
      borderRadius: '4px',
      lineHeight: '20px',
      background: '#e6f4ff',
      color: '#0958d9',
      fontSize: '12px',
      padding: '2px 7px',
      userSelect: 'none',
    }
  }

  toString(style: CSS.Properties) {
    return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')
  }

  toDOM() {
    const span = document.createElement('span')
    if (!this.text)
      return span
    span.style.cssText = this.style ? this.toString(this.style) : this.toString(this.defaultStyle())
    span.textContent = this.text
    return span
  }

  ignoreEvent() {
    return true
  }
}

export function tag(regexp?: RegExp, style?: CSS.Properties) {
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
