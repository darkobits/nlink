import parsePackageName from './parse-package-name';


describe('parsePackageName', () => {
  describe('provided a scoped package name', () => {
    it('should return an object with the scope and name', () => {
      const name = '@babel/preset-env';
      const expected = {
        scope: '@babel',
        name: 'preset-env'
      };

      const result = parsePackageName(name);

      expect(result && result.scope).toBe(expected.scope);
      expect(result && result.name).toBe(expected.name);
    });
  });

  describe('provided an un-scoped package name', () => {
    it('should return an object with the  name', () => {
      const name = 'npm-run-all';
      const expected: any = {
        scope: undefined,
        name
      };

      const result = parsePackageName(name);

      expect(result && result.scope).toBe(expected.scope);
      expect(result && result.name).toBe(expected.name);
    });
  });

  describe('provided an invalid package name', () => {
    it('should return undefined', () => {
      expect(parsePackageName('!$#^&!#$^%')).toBe(undefined);
      expect(parsePackageName()).toBe(undefined);
    });
  });
});
