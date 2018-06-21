describe('cleanLink', () => {
  let cleanLink: Function;

  const NPM_PREFIX = '/npm/prefix';

  const PKG_ROOT = '/pkg/root';

  const PKG_NAME = 'pkg-name';

  const DEPENDENCIES = {
    foo: '1.0',
    bar: '2.0'
  };

  let PKG_JSON: any;

  const mocks: any = {};

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();

    jest.doMock('execa', () => {
      mocks.shellSync = jest.fn((command: string) => {
        if (command === 'npm prefix -g') {
          return {stdout: NPM_PREFIX};
        }
      });

      return {
        shellSync: mocks.shellSync
      };
    });

    jest.doMock('pkg-dir', () => {
      mocks.pkgDirSync = jest.fn(() => {
        return PKG_ROOT;
      });

      return {
        sync: mocks.pkgDirSync
      };
    });

    jest.doMock('fs-extra', () => {
      mocks.readFileSync = jest.fn((path: string) => {
        if (path.endsWith('package.json')) {
          return JSON.stringify(PKG_JSON);
        }
      });

      mocks.ensureDirSync = jest.fn(() => {
        return;
      });

      return {
        readFileSync: mocks.readFileSync,
        ensureDirSync: mocks.ensureDirSync
      };
    });

    jest.doMock('rimraf', () => {
      mocks.rimrafSync = jest.fn(() => {
        return;
      });

      return {
        sync: mocks.rimrafSync
      };
    });

    jest.doMock('./create-symlink', () => {
      mocks.createSymlink = jest.fn();
      return mocks.createSymlink;
    });

    cleanLink = require('./clean-link').default; // tslint:disable-line no-require-imports
  });

  describe('creating symlinks', () => {
    beforeEach(() => {
      PKG_JSON = {
        name: PKG_NAME,
        dependencies: DEPENDENCIES
      };
    });

    it('should create symlinks and return the link directory', () => {
      const result = cleanLink();

      expect(mocks.shellSync).toHaveBeenCalledWith('npm prefix -g');

      expect(mocks.pkgDirSync).toHaveBeenCalled();

      expect(mocks.readFileSync).toHaveBeenCalledWith(`${PKG_ROOT}/package.json`, {encoding: 'utf8'});

      expect(mocks.ensureDirSync).toHaveBeenCalledWith(`${NPM_PREFIX}/lib/node_modules/${PKG_NAME}`);

      expect(mocks.rimrafSync).toHaveBeenCalledWith(`${NPM_PREFIX}/lib/node_modules/${PKG_NAME}/**`);

      expect(mocks.createSymlink).toHaveBeenCalledTimes(3);

      expect(mocks.createSymlink).toHaveBeenCalledWith(`${PKG_ROOT}/package.json`, `${NPM_PREFIX}/lib/node_modules/${PKG_NAME}/package.json`, 'file');

      Object.keys(DEPENDENCIES).forEach((dependency: string) => {
        expect(mocks.createSymlink).toHaveBeenCalledWith(`${PKG_ROOT}/node_modules/${dependency}`, `${NPM_PREFIX}/lib/node_modules/${PKG_NAME}/node_modules/${dependency}`, 'dir');
      });

      expect(result).toBe(`${NPM_PREFIX}/lib/node_modules/${PKG_NAME}`);
    });
  });

  describe('when the package has a string "bin" field', () => {
    const BIN = 'dist/bin/cli.js';

    beforeEach(() => {
      PKG_JSON = {
        ...PKG_JSON,
        bin: BIN
      };

      cleanLink();
    });

    it('should create a symlink for the binary', () => {
      expect(mocks.createSymlink).toHaveBeenCalledWith(`${NPM_PREFIX}/lib/node_modules/${PKG_NAME}/${BIN}`, `${NPM_PREFIX}/bin/${PKG_NAME}`, 'file');
    });
  });

  describe('when the package has an object "bin" field', () => {
    const BIN = {
      foo: 'dist/bin/foo.js',
      bar: 'dist/bin/bar.js'
    };

    beforeEach(() => {
      PKG_JSON = {
        ...PKG_JSON,
        bin: BIN
      };

      cleanLink();
    });

    it('should create symlinks for each binary', () => {
      Object.entries(BIN).forEach(([name, path]) => {
        expect(mocks.createSymlink).toHaveBeenCalledWith(`${NPM_PREFIX}/lib/node_modules/${PKG_NAME}/${path}`, `${NPM_PREFIX}/bin/${name}`, 'file');
      });
    });
  });


  // ----- Error-Handling ------------------------------------------------------

  describe('when the package does not have a "package.json"', () => {
    beforeEach(() => {
      mocks.pkgDirSync.mockImplementation(() => false);
    });

    it('should throw an error', () => {
      expect(() => {
        cleanLink();
      }).toThrow('Unable to locate the package\'s root directory.');
    });
  });

  describe('when the package\'s "package.json" does not have a "name" field', () => {
    beforeEach(() => {
      PKG_JSON = {};
    });

    it('should throw an error', () => {
      expect(() => {
        cleanLink();
      }).toThrow('Package must have a "name" field to be linked.');
    });
  });

  describe('when the package has "bin" field and an invalid "name', () => {
    const BAD_NAME = '_123!@#$%^&**()';

    beforeEach(() => {
      PKG_JSON = {
        name: BAD_NAME,
        bin: 'foo'
      };
    });

    it('should throw an error', () => {
      expect(() => {
        cleanLink();
      }).toThrow(`Invalid package name: "${BAD_NAME}"`);
    });
  });

  describe('when the package has an invalid "bin" field', () => {
    beforeEach(() => {
      PKG_JSON = {
        name: PKG_NAME,
        bin: 42
      };
    });

    it('should throw an error', () => {
      expect(() => {
        cleanLink();
      }).toThrow('Expected type of "bin" field to be "string" or "object", got "number".');
    });
  });
});
