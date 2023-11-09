import { EditorView } from '@codemirror/view'

export function contextmenu() {
  return EditorView.domEventHandlers({
    contextmenu: (event, view) => {
      event.preventDefault()
      console.log(view)
    },
  })
}
