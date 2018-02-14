import React, { Component } from 'react';
import {
  EuiFieldText,
  EuiFormRow,
} from '@elastic/eui';

class TextInput extends Component {

  static id = 'text';

  onValueChange = (event) => {
    this.props.onChange(this.props.fieldId, event.target.value);
  };

  render() {
    const { config, value } = this.props;
    return (
      <EuiFormRow
        label={config.name}
        helpText={config.help}
      >
        <EuiFieldText
          value={value}
          onChange={this.onValueChange}
        />
      </EuiFormRow>
    );
  }
}

export { TextInput };
