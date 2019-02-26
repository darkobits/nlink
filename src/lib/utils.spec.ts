import execa from 'execa';
import {getNpmPathPrefix} from './utils';


jest.mock('execa', () => {
  const execaModule: any = jest.fn(() => {
    return {
      stdout: ''
    };
  });

  execaModule.sync = jest.fn(() => {
    return {
      stdout: ''
    };
  });

  execaModule.shell = jest.fn(() => {
    return {
      stdout: ''
    };
  });

  execaModule.shellSync = jest.fn(() => {
    return {
      stdout: ''
    };
  });

  return execaModule;
});


describe('getNpmPathPrefix', () => {
  it('should call "npm prefix -g"', () => {
    getNpmPathPrefix();
    expect(execa.shellSync).toHaveBeenCalledWith('npm prefix -g');
  });
});
