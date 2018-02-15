import React, { Component } from 'react';

import './template_app.less';

import { TemplateEditor } from '../editor/editor_component';

class TemplateApp extends Component {

  state = {
    template: ''
  };

  constructor(props) {
    super(props);
    this._$http = props.injector.get('$http');
  }

  updateTemplateString = (template) => {
    this.setState({ template });
  };

  render() {
    return (
      <TemplateEditor $http={this._$http} />
    );
  }
}

export { TemplateApp };
