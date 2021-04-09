import Vue from 'vue';
import filters from '@dynamic/filters';
import config from '@dynamic/config';
import {injectElement} from './helpers/dom';
import {fetchNpmVersions} from './helpers/registry';
import {resolveTemplate} from './helpers/template';
import {collapseVersions, describeVersion} from './helpers/versions';

// Components
import VersionsDropdown from './components/VersionsDropdown.vue';

function createItemsForVersions(config, versions) {
  if (config.exclude) {
    const regex = new RegExp(config.exclude);
    versions = versions.filter(({name}) => !name.match(regex));
  }

  return collapseVersions(config, versions).map((version) => {
    const variables = describeVersion(version);
    const text = resolveTemplate(config.text, variables, filters);
    let link = resolveTemplate(config.link, variables, filters);
    const {target} = config;

    // Make the link relative to the current URL so the router will
    // be able to detect if the link is the current docs version.
    if (link.startsWith(origin)) {
      link = link.substring(origin.length);
    }

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
          link: resolveTemplate(
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
