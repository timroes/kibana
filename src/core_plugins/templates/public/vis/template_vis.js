import React, { Component } from 'react';

import './vis_styles.less';

import { getVisualizeLoader } from 'ui/visualize/loader';

import { TemplateCompiler } from '../utils/compiler';

class TemplateVis extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this._compiler = new TemplateCompiler();
    this._SavedVis = props.vis.type.visConfig.savedVis();
    this.state = {
      compiledTemplate: ''
    };
    this.compile(props);
  }

  compile(props) {
    const { template, controls } = props.vis.type.templateConfig;
    this._compiler.compile(template, controls, props.vis.params).then(async compiledTemplate => {
      const loader = await getVisualizeLoader();
      const vis = new this._SavedVis({ type: 'vega' });
      await vis.init();
      vis.vis.params.spec = compiledTemplate;
      this.setState({ vis, loader });
    });
  }

  componentWillReceiveProps(props) {
    this.compile(props);
  }

  componentDidUpdate() {
    const { loader, vis } = this.state;
    if (loader && vis) {
      this.state.loader.embedVisualizationWithSavedObject(this._container, this.state.vis);
    }
  }

  render() {
    return (
      <div
        className="template-vis"
        ref={el => this._container = el}
      />
    );
  }
}

export { TemplateVis };
