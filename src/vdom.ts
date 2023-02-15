
interface ElementWithVState extends Element {
  vnode: VNode;
}

interface VNodeAttributes {
  onclick?: (event: Event) => void;
  class?: string;
  id?: string;

}

interface VNode {
  tagName: string;
  props: object;
  children: VNode[];
};


export const createVNode = (tagName: string, props: VNodeAttributes = {}, ...children: VNode[]): VNode => {

  return {
    tagName,
    props,
    children: children.flat()
  }
};

export const createDOMNode = (vnode: VNode): ElementWithVState => {  
  let root = null;
  const stack = [{ curVNode: vnode, parent: null }];

  while (stack.length) {
    let createdDOMNode = null;
    const { curVNode, parent } = stack.shift();

    if (typeof curVNode === "string") {
      createdDOMNode =  document.createTextNode(curVNode);
    } else {
      const { tagName, props, children } = curVNode;

      createdDOMNode = document.createElement(tagName);
  
      patchProps(createdDOMNode, {}, curVNode.props);

      children?.forEach((childVNode) => {
        stack.push({ curVNode: childVNode, parent: createdDOMNode });
      });
    }

    if (!root){
      root = createdDOMNode;
    }
  
    if (parent) {
      parent.appendChild(createdDOMNode)
    }
  }

  return root;
};

export const mount = (node: ElementWithVState, target: ElementWithVState): ElementWithVState => {
  target.replaceWith(node);
  return node;
}

export const patchNode = (node: ElementWithVState, vNode: VNode, nextVNode: VNode): ElementWithVState => {
  if (!nextVNode) {
    node.remove();
    return;
  }

  if (typeof vNode === 'string' || typeof nextVNode === 'string') {
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    return node;
  }

  if (!vNode || vNode.tagName !== nextVNode.tagName) {
    const newNode = createDOMNode(nextVNode);
    node.replaceWith(newNode);
    return newNode;
  }

  patchProps(node, vNode.props, nextVNode.props);
  patchChildren(node, vNode.children, nextVNode.children);

  return node;
}

function listener(event: Event) {
  return this[event.type]();
}

const patchProp = (node: ElementWithVState, key, nextProp) => {
  if (key.startsWith('on')) {
    const eventName = key.slice(2);
    node[eventName] = nextProp;

    if (!nextProp) {
      node.removeEventListener(eventName, listener);
    }
    if (nextProp) {
      node.addEventListener(eventName, listener)
    }
    return;
  }

  if (!nextProp) {
    node.removeAttribute(key);
    return;
  }

  node.setAttribute(key, nextProp)
}

const patchProps = (node: ElementWithVState, props: VNodeAttributes = {}, nextProps: VNodeAttributes = {}): void => {
  const mergedProps = { ...props, ...nextProps };
  Object.entries(mergedProps).forEach(([key,]) => {
    if (props[key] !== nextProps[key]) {
      patchProp(node, key, nextProps[key]);
    }
  });
}

const patchChildren = (node: ElementWithVState, vChildren: VNode[], vNextChildren: VNode[]): void => {
  (node.childNodes as NodeListOf<ElementWithVState>).forEach((child: ElementWithVState, index: number) => {
    patchNode(child, vChildren[index], vNextChildren[index]);
  });


  vNextChildren?.slice(vChildren.length).forEach((child: VNode) => {
    node.appendChild(createDOMNode(child));
  })
}

export const patch = (node: ElementWithVState, nextVApp: VNode): ElementWithVState => {
  const { vnode } = node;
  node = patchNode(node, vnode, nextVApp);
  node.vnode = nextVApp;
  return node;
}
