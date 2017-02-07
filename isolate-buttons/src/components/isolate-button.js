import {h, div, h1, h2, button, p} from '@cycle/dom'

const view = (state$) =>
  state$.map(state =>
    div(
      {style:
        { 'background': state.colour,
          'margin': '15px',
          'padding': '10px',
          'width': '25%',
          'float': 'left'
        }
      },
      [button('.add',
        {style: {'padding': '5px', 'margin': '5px'}},
        ['Add New | ' + b]),
      button('.delete',
        {style: {'padding': '5px', 'margin': '5px', 'float': 'right'}},
        ['delete'])
      ])
  );


const intent = ({DOM}) => ({
  addButton$: DOM.select('.add').events('click')
    .map(() => ({ colour : '#'+ Math.floor(Math.random()*16777215).toString(16)}) ),
});

const model = (props, actions$) => {
  return props.merge(actions$)
    .startWith({})
    // ????
    .scan((state, change) => Object.assign({}, state, change))
    .shareReplay(1);
}

function Buttons ({DOM, props}) {
  const actions$ = intent(DOM)
  const state$ = model(props, actions$)
  const vtree$ = state$.map(view)

  return {
    DOM: vtree$,
    Pops: state$
  };
}

export default Buttons
