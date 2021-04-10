const FILTER_PATTERN = '\\|\\s*(?<filter>\\w+)\\s*';

function resolveTemplate(value, variables, filters) {
  if (!value) {
    return value;
  }

  for (const [variable, replacement] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${variable}\\s*(${FILTER_PATTERN})?}}`, 'g');
    value = value.replace(regex, (_, __, filter) => {
      const res = filter && filters[filter] ?
        filters[filter](replacement, variables) :
        replacement;

      return res === undefined || res === null ? '' : res;
    });
  }

  return value;
}

module.exports = {
  resolveTemplate,
};
