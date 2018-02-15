import React, { Component } from 'react';

import { CustomizedEditor } from '../editor/customized_editor';

class TemplateVisEditor extends Component {

  constructor(props) {
    super(props);
    // TODO: fil in default values
    this.state = {
      params: { ...props.scope.vis.params }
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      params: { ...props.scope.vis.params }
    });
  }

  onStateChanged = (params) => {
    this.props.stageEditorParams(params);
    this.setState({ params });
  };

  render() {
    return (
      <CustomizedEditor
        controls={this.props.scope.vis.type.templateConfig.controls}
        state={this.state.params}
        onStateChanged={this.onStateChanged}
        enableControlEditing={false}
      />
    );
  }
}

export { TemplateVisEditor };
