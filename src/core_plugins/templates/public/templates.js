import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { CATEGORY } from 'ui/vis/vis_category';

import { TemplateVis } from './template_vis';
import { TemplateEditor } from './editor/template_editor';

VisTypesRegistryProvider.register(Private => {
  const VisFactory = Private(VisFactoryProvider);

  VisFactory.createReactVisualization({
    name: 'template',
    title: 'Custom visualization',
    description: 'Create a custom visualization with its editor',
    category: CATEGORY.OTHER,
    icon: 'sliders-h',
    visConfig: {
      component: TemplateVis
    },
    editor: TemplateEditor,
    requestHandler: 'none',
    responseHandler: 'none',
    options: {
      showQueryBar: false,
      showFilterBar: false,
      showIndexSelection: false
    },
  });
});
