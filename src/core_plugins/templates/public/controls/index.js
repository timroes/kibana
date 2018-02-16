import textfield from './textfield';
import checkbox from './checkbox';
import index from './select_index';

const Controls = {
  [checkbox.id]: checkbox,
  [textfield.id]: textfield,
  [index.id]: index,
};

export * from './utils';

export { Controls };
