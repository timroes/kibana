import React from 'react';
import ReactDOM from 'react-dom';

import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

import 'ui/autoload/styles';
import 'ui/autoload/all';

import { TemplateApp } from './app/template_app';

chrome.setRootTemplate('<div id="templateEditor"></div>');

// const store = configureStore();
// const history = createHistory();

// TODO: For sure not the best way to wait for chrome
uiModules.get('kibana').run(($injector) => {
  setTimeout(() => {
    ReactDOM.render(
      <TemplateApp injector={$injector}/>,
      document.getElementById('templateEditor')
    );
  });
});
