const fs = require('fs');
const fetch = require('node-fetch');
const {resolve} = require('path');
const {fetchNpmVersions} = require('./helpers/registry');

const DEFAULT_OPTIONS = {
  package: '../../package.json',
  menu: {
    text: '{{version}}',
    locations: [
      '.navbar > .home-link::after',
      '.sidebar > .nav-links > :first-child::before',
    ],
    items: [
      {
        target: '_self',
        type: 'versions',
      },
    ],
  },
};

module.exports = (options, context) => {
  const root = resolve(context.sourceDir, '.vuepress');
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (config.menu) {
    config.menu = {
      ...DEFAULT_OPTIONS.menu,
      ...config.menu,
    };
  }

  const packagePath = resolve(root, config.package);
  const filtersPath = config.filters ?
    resolve(root, config.filters).replace(/\\/g, '/') :
    null;

  try {
    // https://docs.npmjs.com/cli/v7/configuring-npm/package-json
    const {name, version} = JSON.parse(fs.readFileSync(packagePath));
    Object.assign(config, {name, version, ...config});
  } catch (error) {
    throw new Error(
        `Failed to read '${packagePath}': please provide a valid path to your ` +
        'project package.json file by setting the \'package\' plugin option. ' +
        'This path must be relative to the .vuepress folder.',
    );
  }

  return {
    name: 'vuepress-plugin-github-versions',
    clientRootMixin: resolve(__dirname, 'clientRootMixin.js'),
    clientDynamicModules: async () => {
      // Pre-fetch existing versions so they are included in the built assets.
      // This provides a decent fallback if the api used to retrieve available
      // versions (e.g. jsDelivr) become unresponsive. However, we discard the
      // npm tags since they will change when a new version is published.
      const versions = await fetchNpmVersions(fetch, config.name);
      config.versions = versions.map((d) => ({...d, tag: null}));

      return [
        {
          name: 'config.js',
          content: `
            module.exports = ${JSON.stringify(config)};
          `,
        },
        {
          name: 'filters.js',
          content: filtersPath ? `
            const filters = require('${filtersPath}');
            module.exports = filters;
          ` : `
            module.exports = {};
          `,
        },
      ];
    },
  };
};
