'use strict'

import { createVNode, patchNode, createDOMNode, patch } from './vdom.js';

let state = {
  counter: 0,
};

const createVApp = (state) => {
  const { counter } = state;

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
      ])
    ]
  );

  return testNode;
};

let root = document.getElementById("root");

let vApp = createVApp(state);
let app = patch(root, vApp);

setInterval(() => {
  state.counter += 1;
  app = patch(app, createVApp(state));
}, 1000);
