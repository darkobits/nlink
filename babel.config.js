module.exports = {
  presets: [
    '@babel/env',
    '@babel/typescript'
  ],
  plugins: [
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json'
      ]
    }]
  ],
  comments: false
};
