import React, { Component } from 'react';

import './template_editor.less';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiPage,
  EuiPageContentBody,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSideBar,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  htmlIdGenerator,
} from '@elastic/eui';

import 'brace/mode/hjson';

import { toastNotifications } from 'ui/notify';
import { SavedObjectsClient } from 'ui/saved_objects';

import { Controls } from '../controls';

import { AddControl } from './add_control';
import { CustomizedEditor } from './customized_editor';
import { ControlEditor } from './control_editor';
import { PipelineEditor } from './pipeline_editor';
import { LoadDialog, TitleEditor } from './dialogs';
import { StepHelp } from './help/step_help';

import { renderIntoElement } from '../utils/render';

import { TemplateCompiler } from '../utils/compiler';

class TemplateEditor extends Component {

  savedObjId = null;

  fieldIdGenerator = htmlIdGenerator();

  state = {
    controls: [],
    state: {},
    templateName: 'Untitled Template',
    template: '',
    showEditor: false,
    showTemplateNameEditor: false,
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
      id: `field${this.fieldIdGenerator()}`,
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
      renderIntoElement(this.container, compiledTemplate);
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

  onChangeTemplateName = (templateName) => {
    this.setState({ templateName });
  };

  toggleShowEditor = () => {
    this.setState(state => ({
      showEditor: !state.showEditor
    }));
  };

  onSaveTemplate = () => {
    // TODO: current state as default state?
    const attributes = {
      title: this.state.templateName,
      config: JSON.stringify({
        controls: this.state.controls,
        template: this.state.template,
      }),
    };
    const saving = this.savedObjId ?
      this._savedObjectsClient.update('vis-template', this.savedObjId, attributes) :
      this._savedObjectsClient.create('vis-template', attributes);

    saving.then((obj) => {
      this.savedObjId = obj.id;
      toastNotifications.addSuccess('The template was saved.');
    });
  };

  loadSavedTemplates = (query) => {
    return this._savedObjectsClient.find({
      type: 'vis-template',
      search: `${query}*`,
    }).then(result => {
      return result.savedObjects.map(obj => ({
        title: obj.attributes.title,
        value: obj,
      }));
    });
  };

  onLoadTemplate = (savedObj) => {
    const { controls, template } = JSON.parse(savedObj.attributes.config);
    this.setState({
      controls,
      template,
      templateName: savedObj.attributes.title,
      state: {},
    });
    this.savedObjId = savedObj.id;
  };

  renderEditorBody() {
    return (
      <React.Fragment>
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
              controls={this.state.controls}
              action={this.state.editControl.action}
              controlOptions={this.state.editControl.options}
              onCancel={this.cancelEditControl}
              onSave={this.saveEditControl}
            />
          }
        </EuiPageSideBar>
        <EuiPageContentBody className="template-app__content">
          <div className="template-editor__preview" ref={el => this.container = el}/>
        </EuiPageContentBody>
      </React.Fragment>
    );
  }

  renderEmptyState() {
    return (
      <div className="template-editor__empty">
        <StepHelp />
      </div>
    );
  }

  render() {
    const showEmptyState = !this.state.template && this.state.controls.length === 0;
    return (
      <React.Fragment>
        <EuiPage>
          <EuiPageHeader>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiTitle className="template-app__title">
                  <h1>
                    {this.state.templateName}
                  </h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <TitleEditor
                  value={this.state.templateName}
                  onChange={this.onChangeTemplateName}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageHeader>
          <EuiPageBody>
            { showEmptyState ? this.renderEmptyState() : this.renderEditorBody() }
          </EuiPageBody>
        </EuiPage>
        <div className="bottom-bar">
          { this.state.showEditor &&
            <PipelineEditor
              value={this.state.template}
              onChange={this.updateTemplateString}
            />
          }
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <AddControl
                controls={Object.values(Controls)}
                onAddControl={this.onAddControl}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="console"
                color="ghost"
                onClick={this.toggleShowEditor}
              >
                Pipeline template
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={true}/>
            <EuiFlexItem grow={false}>
              <LoadDialog
                button={<EuiButtonEmpty color="ghost">Load</EuiButtonEmpty>}
                loadEntries={this.loadSavedTemplates}
                onLoad={this.onLoadTemplate}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                color="ghost"
                onClick={this.onSaveTemplate}
              >
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </React.Fragment>
    );
  }
}

export { TemplateEditor };
