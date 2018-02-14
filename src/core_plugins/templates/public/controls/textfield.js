import React from 'react';

import {
  EuiFieldText,
  EuiFormRow,
} from '@elastic/eui';

function TextField(props) {
  const { options, value, onValueChange } = props;
  return (
    <EuiFormRow
      label={options.label}
      helpText={options.helpText}
    >
      <EuiFieldText
        value={value}
        onChange={event => onValueChange(event.target.value)}
      />
    </EuiFormRow>
  );
}

export default {
  id: 'textfield',
  name: 'Text field',
  icon: 'string',
  component: TextField,
  options: [
    {
      id: 'label',
      name: 'Label',
      type: 'text',
      required: true,
      default: 'Text field',
    },
    {
      id: 'helpText',
      name: 'Help Text',
      type: 'text',
      help: 'Will be shown below the text field if specified.',
    }
  ],
  defaultValue: '',
};
