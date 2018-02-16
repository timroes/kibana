import React from 'react';
import ReactDOM from 'react-dom';

import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

import 'ui/autoload/styles';
import 'ui/autoload/all';

import { TemplateEditor } from '../editor/editor_component';
import './template_app.less';

chrome.setRootTemplate('<div id="templateEditor" class="template-editor"></div>');

// TODO: For sure not the best way to wait for chrome
uiModules.get('kibana').run(($injector) => {
  setTimeout(() => {
    const $http = $injector.get('$http');
    ReactDOM.render(
      <TemplateEditor $http={$http}/>,
      document.getElementById('templateEditor')
    );
  });
});
