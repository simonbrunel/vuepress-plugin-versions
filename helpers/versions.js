// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_REGEX = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const VERSION_COLLATOR = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

const VERSION_GROUPS= {
  major: /^\d\./,
  minor: /^\d\.\d\./,
  patch: /^\d\.\d\.\d/,
};

function describeVersion({name, tag}) {
  const matches = SEMVER_REGEX.exec(name);
  if (!matches) {
    return {};
  }

  const version = name;
  const groups = matches.groups;
  const core = `${groups.major}.${groups.minor}.${groups.patch}`;

  return {
    ...groups,
    version,
    core,
    tag,
  };
}

function collapseVersions({group}, versions) {
  const items = [...versions].sort((d0, d1) => -VERSION_COLLATOR.compare(d0.name, d1.name));
  const regex = VERSION_GROUPS[group];
  const groups = {};

  return !regex ? items : items.filter((item) => {
    const matches = regex.exec(item.name);
    const prefix = matches && matches[0];
    if (prefix && !groups[prefix]) {
      groups[prefix] = item;
      return true;
    }
  });
}

module.exports = {
  collapseVersions,
  describeVersion,
};
