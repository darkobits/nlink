/**
 * Shape of the options object that should be passed to cleanLink();
 */
export interface CleanLinkOptions {
  /**
   * Script in the host project's package.json that builds the project.
   *
   * Ex: 'build'
   */
  buildScript: string;

  /**
   * Argument to pass to the project's build tool that enables watch mode.
   *
   * Ex: 'watch'
   */
  watchArg: string;

  /**
   * Argument to pass to the project's build tool that indicates the output
   * directory.
   *
   * Ex: 'out-dir'
   */
  outDirArg: string;

  /**
   * Location where the project's build artifacts are typically generated.
   *
   * Ex: 'dist'
   */
  distDir: string;
}
