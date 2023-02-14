export const createVNode = (tagName, props = {}, children = []) => {

  return {
    tagName,
    props,
    children
  }
};

export const createDOMNode = (vnode) => {  
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
  
      Object.entries(props).forEach(([key, value]) => {
        createdDOMNode.setAttribute(key, value);
      });

      children.forEach((childVNode) => {
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

export const mount = (node, target) => {
  target.replaceWith(node);
  return node;
}

export const patchNode = (node, vNode, nextVNode) => {
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

  patchProps(node, vNode, nextVNode);
  patchChildren(node, vNode.children, nextVNode.children);

  return node;
}

const patchProp = (node, key, nextProp) => {
  if (key.startsWith('on')) {
    const eventName = key.slice(2);
    const curEvent = node[eventName];

    if (!nextProp) {
      node.removeEventListener(key, curEvent);
    }
  }

  if (!nextProp) {
    node.removeAttribute(key);
    return;
  }

  node.setAttribute(key, nextProp)
}

const patchProps = (node, vNode, nextVNode) => {
  const { props } = vNode;
  const { props: nextProps } = nextVNode;
  if (!nextProps) {
    Object.entries(props).forEach(([key, value]) => {
      patchProp(node, key, null);
    });
    return;
  } 

  const mergedProps = { ...props, ...nextProps };
  
  Object.entries(mergedProps).forEach(([key, value]) => {
    if (props[key] !== nextProps[key]) {
      patchProp(node, key, nextProps[key]);
    }
  });
}

const patchChildren = (node, vChildren, vNextChildren) => {
  console.log(node.childNodes);
  node.childNodes.forEach((child, index) => {
    patchNode(child, vChildren[index], vNextChildren[index]);
  });


  vNextChildren.slice(vChildren.length).forEach((child) => {
    node.appendChild(createDOMNode(child));
  })
}

export const patch = (node, nextVApp) => {
  const { vnode } = node;
  node = patchNode(node, vnode, nextVApp);
  node.vnode = nextVApp;
  return node;
}
