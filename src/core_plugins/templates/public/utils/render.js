import { getVisualizeLoader } from 'ui/visualize/loader';
import chrome from 'ui/chrome';

async function renderIntoElement(element, compiledTemplate) {
  const loader = await getVisualizeLoader();
  const injector = await chrome.dangerouslyGetActiveInjector();
  const SavedVis = injector.get('SavedVis');
  const vis = new SavedVis({ type: 'vega' });
  await vis.init();
  vis.vis.params.spec = compiledTemplate;
  loader.embedVisualizationWithSavedObject(element, vis, {
    timeRange: {
      from: 'now-7d/d',
      to: 'now'
    }
  });
}

export { renderIntoElement };
