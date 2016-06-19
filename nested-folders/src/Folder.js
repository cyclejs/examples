import xs from 'xstream'
import {div, button} from '@cycle/dom'
import Collection from '@cycle/collection'

function intent(DOMSource) {
  return {
    addChild$: DOMSource.select('.add').events('click').mapTo(null),

    remove$: DOMSource.select('.remove').events('click')
  }
}

function style(backgroundColor) {
  return {
    backgroundColor,
    padding: '2em',
    width: 'auto',
    border: '2px solid black',
  }
}

function makeView(removable, color) {
  return function view(children) {
    return div({style: style(color)}, [
      button('.add', ['Add Folder']),
      removable && button('.remove', ['Remove me']),
      div(children)
    ])
  }
}

function makeRandomColor() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16)
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor
  }
  return '#' + hexColor
}

function createFolderComponent({removable = true}) {
  function Folder(sources) {
    const actions = intent(sources.DOM)

    const children$ = Collection(
      createFolderComponent({}),
      sources,
      actions.addChild$
    )

    const color = makeRandomColor()

    const vdom$ = Collection.pluck(children$, 'DOM')
      .map(makeView(removable, color))

    return {
      DOM: vdom$,
      remove$: actions.remove$
    }
  }

  return Folder
}

export {createFolderComponent}
