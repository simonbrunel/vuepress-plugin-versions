import Vue from 'vue';
import config from '@dynamic/config';
import {injectElement} from './helpers/dom';
import {fetchNpmVersions} from './helpers/registry';
import {resolveTemplate} from './helpers/template';
import {collapseVersions, describeVersion} from './helpers/versions';

// Components
import VersionsDropdown from './components/VersionsDropdown.vue';

const filters = config.filters || {};

function resolveLink(template, variables, filters) {
  let link = resolveTemplate(template, variables, filters);

  // Paths are resolved by the router relative to `base`. But since `base` points to
  // the docs root (i.e. a specific version), the version is already part of `base`.
  // So we need to resolve it relative to origin before passing it to the router.
  // https://github.com/chartjs/Chart.js/issues/8880
  if (link.startsWith('/')) {
    link = `${window.location.origin}${link}`;
  }

  // Make the current link relative to base so the router can mark it as active.
  const prefix = `${window.location.origin}${config.base}`;
  return link.startsWith(prefix) ?
    link.substring(prefix.length) + '/' :
    link;
}

function createItemsForVersions(options, versions) {
  if (options.exclude) {
    const regex = new RegExp(options.exclude);
    versions = versions.filter(({name}) => !name.match(regex));
  }

  let items = collapseVersions(options, versions);
  if (options.limit > 0) {
    items = items.slice(0, options.limit);
  }

  return items.map((version) => {
    const {target} = options;
    const variables = describeVersion(version);
    const text = resolveTemplate(options.text, variables, filters);
    const link = resolveLink(options.link, variables, filters);

    return {
      target,
      text,
      link,
    };
  });
}

function resolveItems(items, versions, version) {
  const results = [];

  for (const item of items) {
    if (item.type === 'versions') {
      results.push(...createItemsForVersions({
        group: 'minor',
        link: '/{{version}}/',
        text: '{{version}}',
        ...item,
      }, versions));
    } else {
      const variables = describeVersion(version);
      const text = resolveTemplate(item.text || '', variables, filters);

      if (item.items) {
        results.push({
          ...item,
          text: text,
          type: 'links',
          items: resolveItems(
              item.items,
              versions,
              version,
          ),
        });
      } else {
        results.push({
          ...item,
          text: text,
          link: resolveLink(
              item.link || '',
              variables,
              filters,
          ),
        });
      }
    }
  }

  return results;
}

function resolveDropdownData(config, versions) {
  const menu = config.menu;
  if (!menu) {
    return {};
  }

  // The version stored in the config doesn't contain the 'tag' info,
  // so let's retrieve the associated data from the `versions` object.
  const version = versions.find((d) => d.name === config.version) || {
    name: config.version,
    tag: null,
  };

  const variables = describeVersion(version);
  const text = resolveTemplate(
      menu.text,
      variables,
      filters,
  );

  const items = resolveItems(
      menu.items || [],
      versions,
      version,
  );

  return {items, text};
}

const state = Vue.observable({
  inserted: false,
  dropdown: {},
});

export default {
  async mounted() {
    {
      // Initialize the state with versions built in the assets.
      const data = resolveDropdownData(config, config.versions || []);
      Vue.set(state, 'dropdown', data);
    }

    try {
      // Then, resync versions with the latest releases.
      const versions = await fetchNpmVersions(fetch, config.name);
      const data = resolveDropdownData(config, versions);
      Object.assign(state.dropdown, data);
    } catch (error) {
      console.error(`Failed to retrieve available versions`);
    }
  },

  async updated() {
    const router = this.$router;

    if (!state.inserted) {
      for (const location of config.menu.locations) {
        const propsData = {item: state.dropdown};
        const component = new VersionsDropdown({router, propsData}).$mount();
        injectElement(this.$el, component.$el, location);
      }

      state.inserted = true;
    }
  },
};
