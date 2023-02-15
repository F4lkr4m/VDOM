'use strict'
//"build": "babel index.js --out-dir dist && cp vdom.js dist/vdom.js"

import { createVNode, patchNode, createDOMNode, patch } from '@';

let state = {
  counter: 0,
  onChange: () => {}
};

const increase = () => {
  state.counter += 1;
  state.onChange && state.onChange();
}

const decrease = () => {
  state.counter -= 1;
  state.onChange && state.onChange();
}

const createVApp = (state) => {
  const { counter } = state;

  return (
    <div {...{ class: "container", "data-count": String(counter) }}>
      <button {...{ class: "button", onclick: increase }} >
        +1
      </button>
      <button {...{ class: "button", onclick: decrease }} >
        -1
      </button>
      <div>
        Счетчик: {String(counter)}
        Контейнер
        <ul>
          Самый классный список:
          <li>1. Котики</li>
          <li>2. Собаки</li>
          <li>3. Ежики</li>
        </ul>
      </div>
    </div>
  )

  const testNode = createVNode(
    'div',
    { id: 'root' },
    [
      createVNode('h1', {}, [`Какой-то текст для виртуального DOM`]),
      createVNode('div', {}, [
        createVNode('div', { class: 'perfect-text' }, [`Еще какой-то текст для примера ${counter}`]),
        createVNode('div', {}, [
          createVNode('div', {} , ['text1']),
          createVNode('div', {}, ['text2', 'text3']),
          'text4',
        ]),
        createVNode('div', {}, ['kek']),
      ]),
      createVNode('button', { onclick: onClick }, ['Какая-то кнопка']),
    ]
  );

  return testNode;
};

let root = document.getElementById("root");

let vApp = createVApp(state);
let app = patch(root, vApp);

state.onChange = () => {
  app = patch(app, createVApp(state));
}
