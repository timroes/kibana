import React, { Component } from 'react';

import {
  EuiButton,
  EuiCodeBlock,
  EuiCodeEditor,
  EuiPage,
  EuiPageContentBody,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSideBar,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

import 'brace/mode/hjson';

import { SavedObjectsClient } from 'ui/saved_objects';

import { Controls } from '../controls';

import { AddControl } from './add_control';
import { CustomizedEditor } from './customized_editor';
import { ControlEditor } from './control_editor';

import { TemplateCompiler } from '../utils/compiler';

class TemplateEditor extends Component {

  totalFieldCount = 1;

  state = {
    controls: [],
    state: {},
    templateName: '',
    template: '',
  };

  constructor(props) {
    super(props);

    this._compiler = new TemplateCompiler();

    this._savedObjectsClient = new SavedObjectsClient({
      $http: props.$http
    });
  }

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
    // TODO: need to rename state variables if varName changed
    this.compileTemplate(controls, this.state.template, this.state.state);
    this.setState({
      controls,
      editControl: null,
    });
  };

  compileTemplate(controls, template, state) {
    this._compiler.compile(template, controls, state).then(compiledTemplate => {
      this.setState({ compiledTemplate });
    });
  }

  onStateChanged = (state) => {
    this.compileTemplate(this.state.controls, this.state.template, state);
    this.setState({ state });
  };

  updateTemplateString = (template) => {
    this.compileTemplate(this.state.controls, template, this.state.state);
    this.setState({ template });
  }

  onChangeTemplateName = (event) => {
    this.setState({
      templateName: event.target.value
    });
  };

  onSaveTemplate = () => {
    console.log('save template');
    // TODO: current state as default state?
    this._savedObjectsClient.create('vis-template', {
      title: this.state.templateName,
      config: JSON.stringify({
        controls: this.state.controls,
        template: this.state.template,
      }),
    });
  };

  render() {
    return (
      <EuiPage>
        <EuiPageHeader>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <AddControl
                controls={Object.values(Controls)}
                onAddControl={this.onAddControl}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiFieldText
                placeholder="Template name"
                value={this.state.templateName}
                onChange={this.onChangeTemplateName}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                color="primary"
                onClick={this.onSaveTemplate}
              >
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageHeader>
        <EuiPageBody>
          <EuiPageSideBar style={{ minWidth: '300px' }}>
            <CustomizedEditor
              controls={this.state.controls}
              state={this.state.state}
              onStateChanged={this.onStateChanged}
              enableControlEditing={true}
              onDeleteControl={this.onDeleteControl}
              onEditControl={this.onEditControl}
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
          </EuiPageSideBar>
          <EuiPageContentBody className="template-app__content">
            <EuiCodeEditor
              mode="hjson"
              height="250px"
              width="100%"
              value={this.state.template}
              onChange={this.updateTemplateString}
            />
            <EuiCodeBlock
              language="hjson"
            >
              {this.state.compiledTemplate}
            </EuiCodeBlock>
          </EuiPageContentBody>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

export { TemplateEditor };
