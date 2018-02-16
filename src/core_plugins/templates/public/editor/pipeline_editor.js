import React, { Component } from 'react';
import {
  EuiTextArea
} from '@elastic/eui';

import './pipeline_editor.less';

class PipelineEditor extends Component {

  onValueChange = (event) => {
    this.props.onChange(event.target.value);
  };

  render() {
    return (
      <EuiTextArea
        value={this.props.value}
        onChange={this.onValueChange}
        className="pipeline-editor__textarea"
        placeholder="Kibana visualization pipeline expression"
      />
    );
  }

}

export { PipelineEditor };
