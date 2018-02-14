function getDefaultOptions(control) {
  return control.options.reduce((defaults, opt) => {
    defaults[opt.id] = opt.default;
    return defaults;
  }, {});
}

export { getDefaultOptions };
