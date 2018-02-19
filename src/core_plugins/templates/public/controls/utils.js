function getDefaultOptions(control) {
  return control.options.reduce((defaults, opt) => {
    defaults[opt.id] = opt.default;
    return defaults;
  }, {});
}

function getControlDisplayName(control, controlOptions) {
  const options = {
    ...getDefaultOptions(control),
    ...controlOptions
  };
  console.log(options);
  return options.label || control.name;
}

export { getDefaultOptions, getControlDisplayName };
