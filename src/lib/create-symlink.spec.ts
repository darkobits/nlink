import fs from 'fs-extra';
import createSymlink from './create-symlink';


jest.mock('fs-extra', () => {
  return {
    pathExistsSync: jest.fn(),
    ensureFileSync: jest.fn(),
    ensureDirSync: jest.fn(),
    ensureSymlinkSync: jest.fn()
  };
});


describe('createSymlink', () => {
  describe('when symlinking an existing file', () => {
    const FILE_PATH = '/foo/bar.txt';
    const LINK_PATH = '/link/to/file.txt';

    beforeEach(() => {
      // Return true if called with our "existing file".
      // @ts-ignore
      fs.pathExistsSync.mockImplementation((filePath: string) => {
        return filePath === FILE_PATH;
      });
    });

    it('should create a symlink to the file', () => {
      createSymlink(FILE_PATH, LINK_PATH, 'file');

      // Assert that pathExistsSync was called with the link target.
      expect(fs.pathExistsSync).toHaveBeenCalledWith(FILE_PATH);

      // Assert that we did not try to create a file.
      expect(fs.ensureFileSync).not.toHaveBeenCalled();

      // Assert that we did not try to create a directory.
      expect(fs.ensureDirSync).not.toHaveBeenCalled();

      // Assert that we created a symlink.
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(FILE_PATH, LINK_PATH, 'file');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });

  describe('when symlinking a non-existant file', () => {
    const FILE_PATH = '/foo/bar.txt';
    const LINK_PATH = '/link/to/file.txt';

    beforeEach(() => {
      // @ts-ignore
      fs.pathExistsSync.mockImplementation(() => false);
    });

    it('should create the file, then create a symlink to the file', () => {
      createSymlink(FILE_PATH, LINK_PATH, 'file');

      // Assert that pathExistsSync was called with the link target.
      expect(fs.pathExistsSync).toHaveBeenCalledWith(FILE_PATH);

      // Assert that we created the target file.
      expect(fs.ensureFileSync).toHaveBeenCalledWith(FILE_PATH);

      // Assert that we did not try to create a directory.
      expect(fs.ensureDirSync).not.toHaveBeenCalled();

      // Assert that we created a symlink.
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(FILE_PATH, LINK_PATH, 'file');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });

  describe('when symlinking an existing directory', () => {
    const DIR_PATH = '/foo/bar/bar';
    const LINK_PATH = '/link/to/baz';

    beforeEach(() => {
      // Return true if called with our "existing directory".
      // @ts-ignore
      fs.pathExistsSync.mockImplementation((dirPath: string) => {
        return dirPath === DIR_PATH;
      });
    });

    it('should create a symlink to the directory', () => {
      createSymlink(DIR_PATH, LINK_PATH, 'dir');

      // Assert that pathExistsSync was called with the link target.
      expect(fs.pathExistsSync).toHaveBeenCalledWith(DIR_PATH);

      // Assert that we did not try to create a file.
      expect(fs.ensureFileSync).not.toHaveBeenCalled();

      // Assert that we did not try to create a directory.
      expect(fs.ensureDirSync).not.toHaveBeenCalled();

      // Assert that we created a symlink.
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(DIR_PATH, LINK_PATH, 'dir');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });

  describe('when symlinking a non-existant directory', () => {
    const DIR_PATH = '/foo/bar/bar';
    const LINK_PATH = '/link/to/baz';

    beforeEach(() => {
      // @ts-ignore
      fs.pathExistsSync.mockImplementation(() => false);
    });

    it('should create the directory, then create a symlink to the directory', () => {
      createSymlink(DIR_PATH, LINK_PATH, 'dir');

      // Assert that pathExistsSync was called with the link target.
      expect(fs.pathExistsSync).toHaveBeenCalledWith(DIR_PATH);

      // Assert that we did not try to create a file.
      expect(fs.ensureFileSync).not.toHaveBeenCalled();

      // Assert that we created the directory.
      expect(fs.ensureDirSync).toHaveBeenCalledWith(DIR_PATH);

      // Assert that we created a symlink.
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(DIR_PATH, LINK_PATH, 'dir');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });
});
