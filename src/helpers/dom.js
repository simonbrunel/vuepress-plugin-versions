const LOCATION_REGEX = /^(?<selector>.+?)(::(?<position>after|before))?$/;

function injectElement(root, el, location) {
  const matches = LOCATION_REGEX.exec(location.trim());
  if (!matches) {
    console.error(`Invalid query selector: ${location}`);
    return;
  }

  const {selector, position} = matches.groups;
  const target = root.querySelector(selector.trim());
  if (!target) {
    console.error(`Target '${target}' does not match any element`);
    return;
  }

  if (position) {
    const previous = position === 'before' ? target : target.nextSibling;
    if (previous) {
      target.parentNode.insertBefore(el, previous);
    } else {
      target.parentNode.appendChild(el);
    }
  } else {
    target.appendChild(el);
  }
}

module.exports = {
  injectElement,
};
