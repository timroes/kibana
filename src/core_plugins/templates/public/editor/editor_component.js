import React, { Component } from 'react';

import { Controls } from '../controls';

import { AddControl } from './add_control';
import { CustomizedEditor } from './customized_editor';
import { ControlEditor } from './control_editor';

class TemplateEditor extends Component {

  totalFieldCount = 1;

  state = {
    controls: [],
    state: {}
  };

  onAddControl = (control) => {
    const controls = [...this.state.controls];
    controls.push({
      // TODO: calculate a proper id, that will stay stable
      id: `field${this.totalFieldCount++}`,
      controlId: control.id,
      options: {},
      action: { varName: '' },
    });
    this.setState({ controls });
  };

  onDeleteControl = (controlId) => {
    this.setState(oldState => {
      const controls = oldState.controls.filter(control => control.id !== controlId);
      const state = { ...oldState.state };
      delete state[controlId];
      return { controls, state };
    });
  };

  onEditControl = (control) => {
    this.setState({
      editControl: control
    });
  };

  cancelEditControl = () => {
    this.setState({
      editControl: null
    });
  };

  saveEditControl = (options, action) => {
    const controls = this.state.controls.map(c =>
      c.id === this.state.editControl.id ? { ...c, options, action } : c
    );
    this.setState({
      controls,
      editControl: null,
    });
  };

  onStateChanged = (state) => {
    this.setState({ state });
  };

  render() {
    return (
      <div>
        <CustomizedEditor
          controls={this.state.controls}
          state={this.state.state}
          onStateChanged={this.onStateChanged}
          enableControlEditing={true}
          onDeleteControl={this.onDeleteControl}
          onEditControl={this.onEditControl}
        />
        <AddControl
          controls={Object.values(Controls)}
          onAddControl={this.onAddControl}
        />

        { this.state.editControl &&
          <ControlEditor
            control={Controls[this.state.editControl.controlId]}
            action={this.state.editControl.action}
            controlOptions={this.state.editControl.options}
            onCancel={this.cancelEditControl}
            onSave={this.saveEditControl}
          />
        }
      </div>
    );
  }
}

export { TemplateEditor };
