import { foldGutter } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

interface PathAttributes {
  [key: string]: string
}

interface SVGOptions {
  width: string
  height: string
  viewBox: string
  pathAttributes: PathAttributes
}

function createSVGPath(options: SVGOptions): SVGElement {
  const { width, height, viewBox, pathAttributes } = options
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('viewBox', viewBox)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  for (const [key, value] of Object.entries(pathAttributes))
    path.setAttribute(key, value)
  svg.appendChild(path)
  return svg
}

function createIcon() {
  return {
    right: createSVGPath({
      width: '15',
      height: '15',
      viewBox: '0 0 24 24',
      pathAttributes: {
        'fill': 'none',
        'stroke': 'currentColor',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '1.5',
        'd': 'm9 5l6 7l-6 7',
      },
    }),
    down: createSVGPath({
      width: '15',
      height: '15',
      viewBox: '0 0 24 24',
      pathAttributes: {
        'fill': 'currentColor',
        'fill-rule': 'evenodd',
        'd': 'M4.43 8.512a.75.75 0 0 1 1.058-.081L12 14.012l6.512-5.581a.75.75 0 0 1 .976 1.138l-7 6a.75.75 0 0 1-.976 0l-7-6a.75.75 0 0 1-.081-1.057Z',
        'clip-rule': 'evenodd',
      },
    }),
  }
}

function createDivWithClass(className: string) {
  const div = document.createElement('div')
  div.className = className
  return div
};

export function gutter(): Extension {
  return [
    foldGutter({
      markerDOM: (collapse) => {
        const open = createDivWithClass('cm-gutterIcon open')
        const closed = createDivWithClass('cm-gutterIcon closed')
        const { right, down } = createIcon()
        open.appendChild(down)
        closed.appendChild(right)
        return collapse ? open : closed
      },
    }),
    EditorView.theme({
      '.cm-gutterElement, .cm-gutterIcon': {
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
      },
      '.cm-gutterIcon': {
        paddingRight: '3px',
      },
      '.cm-gutters:hover .cm-gutterIcon.open': {
        opacity: 1,
        transition: 'opacity 0.2s ease-in',
      },
      '.cm-gutterIcon.open': {
        opacity: 0,
        transition: 'opacity 0.2s ease-out',
      },
    }),
  ]
}
