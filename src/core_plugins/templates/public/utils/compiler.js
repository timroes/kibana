import Handlebars from 'handlebars/dist/handlebars.js';

class TemplateCompiler {
  async compile(template, controls, params) {
    // TODO: clean that up
    const data = Object.keys(params)
      .map(fieldId => [fieldId, controls.find(c => c.id === fieldId).action.varName])
      .filter(varName => !!varName)
      .reduce((data, [fieldId, varName]) => ({
        ...data,
        [varName]: params[fieldId]
      }), {});
    try {
      // TODO: cache
      return Handlebars.compile(template)(data);
    } catch (e) {
      // console.log(e);
      // TODO: ignore this most of the time
    }
  }
}

export { TemplateCompiler };
