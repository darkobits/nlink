/**
 * Object we use to describe an intent to create a symlink at 'link' pointing to
 * 'src'.
 */
export interface LinkDescriptor {
  /**
   * Absolute path to an existing file or folder.
   */
  src: string;

  /**
   * Absolute path to the location where a symlink should be created, pointing
   * back to the 'src' file or folder.
   */
  link: string;
}


/**
 * Object we use to describe all symlink we intend to create for a particular
 * package.
 */
export interface NpmLinkPaths {
  /**
   * The primary package folder that will contain source files and dependencies.
   */
  package: LinkDescriptor;

  /**
   * A list of link descriptors for each "bin" declared in the package.
   *
   * N.B. Binaries are linked to a different location than the main package.
   */
  bin?: Array<LinkDescriptor>;
}


/**
 * Options that may be provided to createLink.
 */
export interface CreateLinkOptions {
  /**
   * Whether to symlink the host package's manifest (package.json).
   *
   * Default: `true`
   */
  manifest: boolean;

  /**
   * Whether to symlink the host package's node_modules directory.
   *
   * Default: `true`
   */
  nodeModules: boolean;

  /**
   * Whether to symlink the host package's "files" (as enumerated in its
   * package.json).
   *
   * Default: `true`
   */
  files: boolean;

  /**
   * Whether to symlink the host package's "bin" entry/entries (as enumerated in
   * its package.json).
   *
   * Default: `true`
   */
  bin: boolean;

  /**
   * Whether to perform a dry-run.
   *
   * Default: `false`
   */
  dryRun: boolean;
}
