import fs, {SymlinkType} from 'fs-extra';
import log from 'lib/log';


/**
 * Creates a new symbolic link at 'linkPath' pointing to the existing file
 * indicated by 'existingFile'.
 */
export default function createSymlink(existingFile: string, linkPath: string, type: SymlinkType) {
  if (!fs.pathExistsSync(existingFile)) {
    if (type === 'file') {
      log.verbose('symlink', `Creating file "${existingFile}".`);
      fs.ensureFileSync(existingFile);
    } else if (type === 'dir') {
      log.verbose('symlink', `Creating directory "${existingFile}".`);
      fs.ensureDirSync(existingFile);
    }
  }

  log.verbose('symlink', `${linkPath} => ${existingFile}`);

  fs.ensureSymlinkSync(existingFile, linkPath, type);
}
