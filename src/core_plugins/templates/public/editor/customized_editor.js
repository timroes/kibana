import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './customized-editor.less';

import {
  EuiButtonIcon,
  EuiForm,
} from '@elastic/eui';

import { Controls, getDefaultOptions } from '../controls';

class CustomizedEditor extends Component {

  updateValue(id, value) {
    const state = this.props.state;
    state[id] = value;
    this.props.onStateChanged(state);
  }

  renderControl = (control) => {
    const Control = Controls[control.controlId];
    const options = {
      ...getDefaultOptions(Control),
      ...control.options
    };
    const value = this.props.state[control.id] === undefined ? Control.defaultValue : this.props.state[control.id];
    return (
      <div
        className="control-item"
        key={control.id}
      >
        <Control.component
          key={control.id}
          options={options}
          value={value}
          onValueChange={val => this.updateValue(control.id, val)}
        />
        { this.props.enableControlEditing &&
          <div className="control-item__actions">
            <EuiButtonIcon
              iconType="gear"
              aria-label="Edit control"
              onClick={() => this.props.onEditControl(control)}
            />
            <EuiButtonIcon
              iconType="trash"
              aria-label="Delete control"
              onClick={() => this.props.onDeleteControl(control.id)}
            />
          </div>
        }
      </div>
    );
  };

  render() {
    return (
      <EuiForm>
        { this.props.controls.map(this.renderControl) }
      </EuiForm>
    );
  }

}

CustomizedEditor.propTypes = {
  controls: PropTypes.array,
  enableControlEditing: PropTypes.bool.isRequired,
};

CustomizedEditor.defaultProps = {
  enableControlEditing: false,
};

export { CustomizedEditor };
