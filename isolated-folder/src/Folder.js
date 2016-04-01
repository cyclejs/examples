import {Observable, Subject} from 'rx'
import isolate from '@cycle/isolate'
import {div, button} from 'cycle-snabbdom'
import combineLatestObj from 'rx-combine-latest-obj'

const ADD = id => ({id, type: 'add'})
const REMOVE = id => ({id, type: 'remove'})

function intent({DOM}, action$, id) {
  const add$ = DOM.select('.add').events('click').map(() => ADD(id))
  const remove$ = DOM.select('.remove').events('click').map(() => REMOVE(id))
    .share()
  const removeFolder$ = action$.filter(action => action.type === 'remove')
  return {add$, remove$, removeFolder$}
}

function model(actions, sources, parentId) {
  const newFolderMod$ = actions.add$
    .map(() =>
      function newFolderMod(childrenMap) {
        const children = Array.from(childrenMap.values())
        const length = children.length
        const lastId = length > 0 ? children[length - 1].id : 0
        const id = lastId + 1
        const Folder = createFolderComponent({id})
        const folder = isolate(Folder)(sources)
        return childrenMap.set(id, folder)
      }
    )

  const removeFolderMod$ = actions.removeFolder$
    .map(({id}) =>
      function removeFolderMod(childrenMap)  {
        childrenMap.delete(id)
        return childrenMap
      }
    )

  const children$ = newFolderMod$
    .merge(removeFolderMod$)
    .startWith(new Map([]))
    .scan((children, modFn) => modFn(children))

  return children$.shareReplay(1)
}

function style(color) {
  return {
    backgroundColor: color,
    padding: '2em',
    width: 'auto',
    border: '2px solid black',
    transition: 'all 0.6s ease-in-out',
  }
}

function makeRandomColor() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  return hexColor;
}

function makeView(removable, color) {
  return function view(children) {
    return div({style: style(color)}, [
      button('.add', ['Add Folder']),
      removable && button('.remove', ['Remove me']),
      children && div({}, Array.from(children.values()).map(({id, DOM}) =>
        div({key: id}, [DOM])
      ))
    ])
  }
}

function createFolderComponent({id, removable = true}) {
  return function Folder(sources) {
    const proxyAction$ = new Subject()
    const actions = intent(sources, proxyAction$, id)
    const state$ = model(actions, sources, id)
    const color = makeRandomColor()
    const view$ = state$.map(makeView(removable, color))

    const action$ = state$
      .flatMapLatest(children => Observable.merge(
          Array.from(children.values()).map(c => c.action$)
        ))
      .merge(actions.remove$)
      .share()

    action$.takeUntil(actions.remove$).subscribe(proxyAction$.asObserver())

    return {
      DOM: view$,
      action$,
      id,
    }
  }
}

export {createFolderComponent}
