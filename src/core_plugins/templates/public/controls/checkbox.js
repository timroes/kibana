import React from 'react';

import {
  EuiFormRow,
  EuiSwitch,
} from '@elastic/eui';

function Checkbox(props) {
  const { options, value, onValueChange } = props;
  const v = value !== undefined ? value : options.defautValue;
  return (
    <EuiFormRow
      helpText={options.helpText}
    >
      <EuiSwitch
        value={v}
        label={options.label}
        onChange={event => onValueChange(event.target.checked)}
      />
    </EuiFormRow>
  );
}

export default {
  id: 'checkbox',
  name: 'Checkbox',
  icon: 'check',
  component: Checkbox,
  options: [
    {
      id: 'label',
      name: 'Label',
      type: 'text',
      required: true,
      default: 'On or off',
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
