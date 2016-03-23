import {Observable, Subject} from 'rx'
import isolate from '@cycle/isolate'
import {div, button} from 'cycle-snabbdom'
import combineLatestObj from 'rx-combine-latest-obj'

const ADD = id => ({id, type: 'add'})
const REMOVE = id => ({id, type: 'remove'})

function intent({DOM, action$}, id) {
  const add$ = DOM.select('.add').events('click').map(() => ADD(id))
  const remove$ = DOM.select('.remove').events('click').map(() => REMOVE(id))
  const removeButton$ = action$.filter(action => action.type === 'remove')
  return {add$, remove$, removeButton$}
}

function findButton(children, _id) {
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
  const newButtonMod$ = actions.add$.map(() => children => {
    const lastId = children.length > 0 ?
      parseInt(children[children.length - 1].id) : 0
    const Button = isolate(createButton({id: `${parentId}${lastId + 1}`}))
    const proxyAction$ = new Subject()
    const button = Button({action$: proxyAction$, ...sources})
    const {action$, remove$} = button
    action$.takeUntil(remove$).subscribe(proxyAction$.asObserver())
    return children.concat(button)
  })

  const removeButtonMod$ = actions.removeButton$.map(({id}) => children => {
    const buttonIndex = findButton(children, id)
    if (buttonIndex !== null) {
      children.splice(buttonIndex, 1)
    }
    return children
  })

  const children$ = newButtonMod$
    .merge(removeButtonMod$)
    .startWith([])
    .scan((children, modFn) => modFn(children))

  return combineLatestObj({children$}).shareReplay(1)
}

const style = (color) => ({
  backgroundColor: color,
  padding: '2em',
  width: 'auto',
  border: '2px solid black',
  transition: 'all 0.6s ease-in-out'
})

function makeRandomColor() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  return hexColor;
}

const view = (removable, color) => ({children}) => {
  return div({style: style(color)}, [
    button('.add', ['Add Child']),
    removable && button('.remove', ['Remove me']),
    children && div({}, children.map(({id, DOM}) =>
      div({key: id}, [DOM])
    ))
  ])
}

function createButton({id, removable = true}) {
  return function Button(sources) {
    const actions = intent(sources, id)
    const state$ = model(actions, sources, id)
    const color = makeRandomColor()
    const view$ = state$.map(view(removable, color))

    const action$ = state$
      .flatMapLatest(
        ({children}) => Observable.merge(children.map(c => c.action$))
      )
      .merge(actions.remove$)

    return {
      DOM: view$,
      remove$: actions.remove$,
      action$,
      id,
    }
  }
}

export {createButton}
