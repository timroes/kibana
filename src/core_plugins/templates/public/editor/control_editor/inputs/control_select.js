import React, { Component } from 'react';
import {
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';

import { Controls, getControlDisplayName } from '../../../controls';

class ControlSelect extends Component {

  static id = 'controlSelect';

  onValueChange = (event) => {
    this.props.onChange(this.props.fieldId, event.target.value);
  };

  getFilteredControls() {
    const controls = [...this.props.controls];
    const { config } = this.props;
    if (!config.filter) {
      return controls;
    }
    return controls.filter(control => {
      if (config.filter.type !== control.controlId) {
        return false;
      }
      return true;
    });
  }

  render() {
    const { config, value } = this.props;
    const options = [
      { text: '', value: '' },
      ...this.getFilteredControls().map(control => {
        return {
          text: getControlDisplayName(Controls[control.controlId], control.options),
          value: control.id,
        };
      })
    ];
    return (
      <EuiFormRow
        label={config.name}
        helpText={config.help}
      >
        <EuiSelect
          options={options}
          value={value}
          onChange={this.onValueChange}
        />
      </EuiFormRow>
    );
  }
}

export { ControlSelect };
