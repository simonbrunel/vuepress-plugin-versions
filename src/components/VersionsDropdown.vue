<template>
  <div class="versions-dropdown nav-item can-hide">
    <dropdown-link :item="item" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import DropdownLink from '@theme/components/DropdownLink.vue';

export default Vue.extend({
  components: {
    DropdownLink,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="stylus" scoped>
.versions-dropdown {
  display: inline-block;
  position: relative;
  outline: none;

  :not(.nav-links) > & {
    margin: 8px 16px;
  }

  ::v-deep {
    .dropdown-title,
    .dropdown-wrapper {
      outline: none;

      .nav-dropdown {
        right: initial;
      }
    }
    .nav-link {
      color: inherit;
    }
  }
}
</style>
