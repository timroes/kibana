import React, { Component } from 'react';
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiPopover,
} from '@elastic/eui';

import './title_dialog.less';

class TitleEditor extends Component {

  state = {
    isOpen: false,
  };

  toggleDialog = () => {
    this.setState(state => ({
      isOpen: !state.isOpen
    }));
  };

  cancelDialog = () => {
    this.setState({
      isOpen: false
    });
  };

  onChange = (event) => {
    this.props.onChange(event.target.value);
  };

  render() {
    const button = (
      <EuiButtonIcon
        onClick={this.toggleDialog}
        iconType="pencil"
        color="text"
        aria-label="Edit title"
      />
    );

    return (
      <EuiPopover
        id="templateEditorTitleEditor"
        ownFocus
        button={button}
        closePopover={this.cancelDialog}
        isOpen={this.state.isOpen}
        anchorPosition="rightUp"
      >
        <div className="title-dialog__container">
          <EuiForm>
            <EuiFormRow
              label="Visualization title"
            >
              <EuiFieldText
                value={this.props.value}
                onChange={this.onChange}
              />
            </EuiFormRow>
          </EuiForm>
        </div>
      </EuiPopover>
    );
  }
}

export { TitleEditor };
