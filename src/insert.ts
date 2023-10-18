import type { EditorView } from '@codemirror/view'

export function insertText(text: string, options: {
  view: EditorView
  position: number
}) {
  const { view, position } = options
  view.focus()
  const { from } = view.state.selection.ranges[0]
  view.dispatch(view.state.replaceSelection(text))
  view.dispatch({
    selection: {
      anchor: from + position,
    },
  })
}
