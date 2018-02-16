import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui';

import { Inputs } from './inputs';

class ControlEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      action: props.action,
      controlOptions: props.controlOptions,
    };
  }

  cancelEditor = () => {
    this.props.onCancel();
  };

  saveEditor = () => {
    this.props.onSave(this.state.controlOptions, this.state.action);
  };

  onChangeInput = (id, value) => {
    this.setState({
      controlOptions: { ...this.state.controlOptions, [id]: value }
    });
  };

  onChangeVarName = (event) => {
    this.setState({
      action: {
        varName: event.target.value
      }
    });
  };

  renderOption = (option) => {
    const Input = Inputs[option.type];
    console.log(option);
    console.log(this.state.controlOptions);
    const value = this.state.controlOptions[option.id] === undefined ?
      option.default : this.state.controlOptions[option.id];
    return (
      <Input
        key={option.id}
        fieldId={option.id}
        config={option}
        value={value}
        onChange={this.onChangeInput}
      />
    );
  }

  renderActionEditor() {
    return (
      <EuiFormRow
        label="Variable name"
        helpText="You can access the value of this field via {{varName}} in the template."
      >
        <EuiFieldText
          value={this.state.action.varName}
          onChange={this.onChangeVarName}
        />
      </EuiFormRow>
    );
  }

  render() {
    return (
      <EuiOverlayMask>
        <EuiModal
          onClose={this.cancelEditor}
        >
          <EuiForm onSubmit={this.saveEditor}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Edit Control</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              { this.props.control.options.map(this.renderOption) }
              { this.renderActionEditor() }
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty
                onClick={this.cancelEditor}
                size="s"
              >
                Cancel
              </EuiButtonEmpty>
              <EuiButton
                onClick={this.saveEditor}
                size="s"
                type="submit"
                fill
              >
                OK
              </EuiButton>
            </EuiModalFooter>
          </EuiForm>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}

ControlEditor.propTypes = {
  control: PropTypes.object.isRequired,
  controlOptions: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export { ControlEditor };
