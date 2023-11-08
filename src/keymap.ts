import { indentMore } from '@codemirror/commands'
import {
  keymap,
} from '@codemirror/view'

export function keymapTab(character = ' ') {
  return keymap.of([
    {
      key: 'Tab',
      run: ({ state, dispatch }) => {
        if (state.selection.ranges.some(range => !range.empty))
          return indentMore({ state, dispatch })
        dispatch(state.update(state.replaceSelection(character), { scrollIntoView: true, userEvent: 'input' }))
        return true
      },
    },
  ])
}
