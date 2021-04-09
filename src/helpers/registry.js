async function fetchNpmVersions(fetch, packageName) {
  // The npmjs registry doesn't allow CORS requests, that's why we use jsDelivr.
  // https://github.com/jsdelivr/data.jsdelivr.com#list-package-versions
  // https://github.com/npm/npm-registry-couchapp/issues/108

  const url = `https://data.jsdelivr.com/v1/package/npm/${packageName}`;
  const json = await (await fetch(url)).json();
  const tags = Object.entries(json.tags || []);

  return json.versions.map((version) => ({
    tag: (tags.find((d) => d[1] === version) || [null])[0],
    name: version,
  }));
}

module.exports = {
  fetchNpmVersions,
};
