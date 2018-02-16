import React from 'react';

import {
  EuiFormRow,
  EuiSwitch,
} from '@elastic/eui';

function Checkbox(props) {
  const { options, value, onValueChange } = props;
  return (
    <EuiFormRow
      helpText={options.helpText}
    >
      <EuiSwitch
        checked={value}
        label={options.label}
        onChange={event => onValueChange(event.target.checked)}
      />
    </EuiFormRow>
  );
}

export default {
  id: 'checkbox',
  name: 'Switch',
  icon: 'check',
  component: Checkbox,
  options: [
    {
      id: 'label',
      name: 'Label',
      type: 'text',
      required: true,
      default: 'Switch',
    },
    {
      id: 'helpText',
      name: 'Help Text',
      type: 'text',
      help: 'Will be shown below the text field if specified.',
    }
  ],
  defaultValue: false,
};
