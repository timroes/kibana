import React, { Component } from 'react';

import {
  EuiButtonEmpty,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiPopover,
} from '@elastic/eui';

class AddControl extends Component {

  state = {
    isPopoverOpen: false
  };

  onTriggerClicked = () => {
    this.setState(state => ({
      isPopoverOpen: !state.isPopoverOpen
    }));
  };

  closePopover = () => {
    this.setState({
      isPopoverOpen: false
    });
  };

  onClickControl = (control) => {
    this.props.onAddControl(control);
    this.closePopover();
  };

  renderItem = (control) => {
    return (
      <EuiContextMenuItem
        key={control.id}
        icon={control.icon || 'empty'}
        onClick={() => this.onClickControl(control)}
      >
        {control.name}
      </EuiContextMenuItem>
    );
  };

  render() {
    const triggerButton = (
      <EuiButtonEmpty
        size="s"
        type="text"
        iconType="arrowDown"
        iconSide="right"
        onClick={this.onTriggerClicked}
      >
        Add Control
      </EuiButtonEmpty>
    );

    const items = this.props.controls.map(this.renderItem);

    return (
      <EuiPopover
        id="addControlPopover"
        button={triggerButton}
        isOpen={this.state.isPopoverOpen}
        closePopover={this.closePopover}
        anchorPosition="downLeft"
        panelPaddingSize="none"
      >
        <EuiContextMenuPanel items={items} />
      </EuiPopover>
    );
  }
}

export { AddControl };
