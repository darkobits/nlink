/**
 * Provided a package name, returns an object containing the scope portion (if
 * the package is scoped) and the name portion.
 *
 * @example
 *
 * parsePackageName('@babel/core') => {scope: '@babel', name: 'core'}
 *
 * @example
 *
 * parsePackageName('express') => {scope: undefined, name: 'express'}
 */
export default function parsePackageName(input?: string): {scope?: string; name?: string} | undefined {
  if (!input) {
    return;
  }

  const PKG_NAME_PATTERN = '^(?:(@[\\w\\-]+)\\/)?([\\w\\-]+)$';

  const matches = new RegExp(PKG_NAME_PATTERN, 'ig').exec(input);

  if (!matches) {
    return;
  }

  const [, scope, name] = matches;
  return {scope, name};
}
