import React, { Component } from 'react';
import {
  EuiButtonEmpty,
  EuiFieldSearch,
  EuiPopover,
  EuiPopoverTitle,
} from '@elastic/eui';

import './title_dialog.less';

class LoadDialog extends Component {

  state = {
    isOpen: false,
    entries: [],
    query: '',
  };

  toggleDialog = () => {
    this.setState(state => {
      if (!state.isOpen) {
        this.loadEntries(state.query);
      }
      return {
        isOpen: !state.isOpen
      };
    });
  };

  cancelDialog = () => {
    this.setState({
      isOpen: false
    });
  };

  loadEntries = async (query) => {
    const entries = await this.props.loadEntries(query);
    this.setState({ entries });
  };

  onChangeQuery = (event) => {
    this.setState({ query: event.target.value });
    this.loadEntries(event.target.value);
  };

  onLoad = (entry) => {
    this.props.onLoad(entry);
    this.setState({ isOpen: false });
  }

  renderEntry = (entry) => {
    return (
      <EuiButtonEmpty
        key={entry.title}
        onClick={() => this.onLoad(entry.value)}
      >
        {entry.title}
      </EuiButtonEmpty>
    );
  };

  render() {
    const button = React.cloneElement(this.props.button, { onClick: this.toggleDialog });
    return (
      <EuiPopover
        id="templateEditorLoadDialog"
        ownFocus
        button={button}
        closePopover={this.cancelDialog}
        isOpen={this.state.isOpen}
        anchorPosition="upRight"
      >
        <div className="title-dialog__container">
          <EuiPopoverTitle>
            <EuiFieldSearch
              value={this.state.query}
              onChange={this.onChangeQuery}
            />
          </EuiPopoverTitle>
          <div>
            { this.state.entries.map(this.renderEntry) }
          </div>
        </div>
      </EuiPopover>
    );
  }
}

export { LoadDialog };
