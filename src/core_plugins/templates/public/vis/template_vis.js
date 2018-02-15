import React, { Component } from 'react';
import {
  EuiCodeBlock,
} from '@elastic/eui';

import { TemplateCompiler } from '../utils/compiler';

class TemplateVis extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this._compiler = new TemplateCompiler();
    this.state = {
      compiledTemplate: ''
    };
  }

  componentWillReceiveProps(props) {
    const { template, controls } = props.vis.type.templateConfig;
    this._compiler.compile(template, controls, props.vis.params).then(compiledTemplate => {
      this.setState({ compiledTemplate });
    });
  }

  render() {
    return (
      <EuiCodeBlock>
        {this.state.compiledTemplate}
      </EuiCodeBlock>
    );
  }
}

export { TemplateVis };
