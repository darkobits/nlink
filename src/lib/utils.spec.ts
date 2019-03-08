import os from 'os';
import path from 'path';
import execa from 'execa';
import uuid from 'uuid/v4';
import {
  getIntermediateLinkPathSegment,
  getIntermediateBinPathSegment,
  getNpmLinkPaths,
  introspectPath
} from './utils';


describe('getNpmPathPrefix', () => {
  let getNpmPathPrefix: Function;
  let shellSyncMock: any;

  beforeEach(() => {
    // @ts-ignore
    shellSyncMock = jest.spyOn(execa, 'shellSync').mockImplementation(() => {
      return {stdout: ''};
    });

    getNpmPathPrefix = require('./utils').getNpmPathPrefix; // tslint:disable-line no-require-imports
  });

  it('should call "npm prefix -g"', () => {
    getNpmPathPrefix();
    expect(shellSyncMock).toHaveBeenLastCalledWith('npm prefix -g');
  });
});


describe('getIntermediateLinkPathSegment', () => {
  describe('on Windows platforms', () => {
    beforeEach(() => {
      jest.spyOn(os, 'platform').mockReturnValue('win32');
    });

    it('should return an empty string', () => {
      expect(getIntermediateLinkPathSegment()).toBe('');
    });
  });

  describe('on all other platforms', () => {
    beforeEach(() => {
      jest.spyOn(os, 'platform').mockReturnValue('darwin');
    });

    it('should return "lib"', () => {
      expect(getIntermediateLinkPathSegment()).toBe('lib');
    });
  });
});


describe('getIntermediateBinPathSegment', () => {
  describe('on Windows platforms', () => {
    beforeEach(() => {
      jest.spyOn(os, 'platform').mockReturnValue('win32');
    });

    it('should return an empty string', () => {
      expect(getIntermediateBinPathSegment()).toBe('');
    });
  });

  describe('on all other platforms', () => {
    beforeEach(() => {
      jest.spyOn(os, 'platform').mockReturnValue('darwin');
    });

    it('should return "bin"', () => {
      expect(getIntermediateBinPathSegment()).toBe('bin');
    });
  });
});


describe('getNpmLinkPaths', () => {
  it('return descriptors for source and link locations', () => {
    const result = getNpmLinkPaths();

    expect(result.pkg.src).toBe(process.cwd());
    expect(result.pkg.link).toMatch(/@darkobits\/nlink/g);
    // @ts-ignore
    expect(result.bin.length).toBeGreaterThan(0);
    // @ts-ignore
    expect(result.bin[0].src).toMatch(process.cwd());
  });
});


describe('introspectPath', () => {
  describe('when provided a non-existant path', () => {
    it('should return the correct descriptor', () => {
      const randomPath = path.join('tmp', uuid());

      expect(introspectPath(randomPath)).toMatchObject({
        exists: false,
        isSymbolicLink: false,
        realPath: ''
      });
    });
  });
});
