import textfield from './textfield';
import checkbox from './checkbox';
import index from './select_index';
import field from './select_field';

const Controls = {
  [checkbox.id]: checkbox,
  [textfield.id]: textfield,
  [index.id]: index,
  [field.id]: field,
};

export * from './utils';

export { Controls };
