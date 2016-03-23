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

function findFolder(children, _id) {
  const id = parseInt(_id)
  let pointerId;
  let index;
  let top = children.length;
  let bottom = 0;
  for (let i = children.length - 1; i >= 0; i--) { // binary search
    index = bottom + ((top - bottom) >> 1);
    pointerId = parseInt(children[index].id);
    if (pointerId === id) {
      return index;
    } else if (pointerId < id) {
      bottom = index;
    } else if (pointerId > id) {
      top = index;
    }
  }
  return null;
}

function model(actions, sources, parentId) {
  const newFolderMod$ = actions.add$
    .map(() =>
      function(children) {
        const lastId = children.length > 0 ?
          parseInt(children[children.length - 1].id) : 0
        const Folder = createFolderComponent({id: `${parentId}${lastId + 1}`})
        const folder = isolate(Folder)(sources)
        return children.concat(folder)
      }
    )

  const removeFolderMod$ = actions.removeFolder$
    .map(({id}) =>
      function(children)  {
        const folderIndex = findFolder(children, id)
        if (folderIndex !== null) {
          children.splice(folderIndex, 1)
        }
        return children
      }
    )

  const children$ = newFolderMod$
    .merge(removeFolderMod$)
    .startWith([])
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
      children && div({}, children.map(({id, DOM}) =>
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
      .flatMapLatest(children => Observable.merge(children.map(c => c.action$)))
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
