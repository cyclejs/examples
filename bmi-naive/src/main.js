import Cycle from '@cycle/core';
import {Observable} from 'rx';
import {h, div, input, h2, makeDOMDriver} from '@cycle/dom';

function main({DOM}) {
  let changeWeight$ = DOM.select('#weight').events('input')
    .map(ev => ev.target.value);
  let changeHeight$ = DOM.select('#height').events('input')
    .map(ev => ev.target.value);

  let state$ = Observable.combineLatest(
    changeWeight$.startWith(70),
    changeHeight$.startWith(170),
    (weight, height) => {
      let heightMeters = height * 0.01;
      let bmi = Math.round(weight / (heightMeters * heightMeters));
      return {weight, height, bmi};
    }
  );

  return {
    DOM: state$.map(({weight, height, bmi}) =>
      div([
        div([
          'Weight ' + weight + 'kg',
          input('#weight', {type: 'range', min: 40, max: 140, value: weight})
        ]),
        div([
          'Height ' + height + 'cm',
          input('#height', {type: 'range', min: 140, max: 210, value: height})
        ]),
        h2('BMI is ' + bmi)
      ])
    )
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container')
});
