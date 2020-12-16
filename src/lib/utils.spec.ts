import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';
import {
  getIntermediateLinkPathSegment,
  getIntermediateBinPathSegment,
  getNpmLinkPaths,
  introspectPath
} from './utils';


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
  // Failing: Cannot find module 'spdx-license-ids' from
  // 'node_modules/spdx-expression-parse/scan.js'.
  it.skip('should return descriptors for source and link locations', () => {
    const npmMock = {
      sync: jest.fn(() => {
        return {
          stdout: '/foo/bar'
        };
      })
    };

    const result = getNpmLinkPaths(npmMock as any);

    expect(result.package.src).toBe(process.cwd());
    expect(result.package.link).toMatch(/@darkobits\/nlink/g);
    // @ts-ignore
    expect(result.bin.length).toBeGreaterThan(0);
    // @ts-ignore
    expect(result.bin[0].src).toMatch(process.cwd());
  });
});


describe('introspectPath', () => {
  describe('when provided a non-existent path', () => {
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
