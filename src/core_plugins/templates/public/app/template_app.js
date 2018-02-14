import React, { Component } from 'react';
import {
  EuiCodeBlock,
  EuiCodeEditor,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageSideBar,
  EuiTitle,
} from '@elastic/eui';

import 'ui/visualize/visualization';

import './template_app.less';
import 'brace/mode/hjson';

import { TemplateEditor } from '../editor/editor_component';

class TemplateApp extends Component {

  state = {
    template: ''
  };

  // updateVisualization() {
  //   const $compile = this.props.injector.get('$compile');
  //   const element = $compile('<visualization></visualization>')({});
  //   if (this.vis.firstChild) {
  //     this.vis.removeChild(this.vis.firstChild);
  //   }
  //   this.vis.appendChild(element[0]);
  // }

  updateTemplateString = (template) => {
    this.setState({ template });
  };

  componentDidUpdate(prevProps, prevState) {
    // if (prevState.template !== this.state.template) {
    //   this.updateVisualization();
    // }
  }

  render() {
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageSideBar style={{ minWidth: '300px' }}>
            <TemplateEditor />
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
              {this.state.template}
            </EuiCodeBlock>
          </EuiPageContentBody>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

export { TemplateApp };
