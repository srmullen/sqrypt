import { OPTION_RE, FILE_RE } from './regex';

describe('regex', () => {
  describe('FILE_RE', () => {
    test('it matches', () => {
      const param = '%{./package.json}[_]';
      const match = param.match(FILE_RE);
      expect(match).not.toBeNull();
    });

    test('it matches without path', () => {
      const param = '%{./package.json}';
      const match = param.match(FILE_RE);
      expect(match).not.toBeNull();
    });

    test('it matches', () => {
      const param = '%{./package.json}.functions[_]';
      const match = param.match(FILE_RE);
      expect(match).not.toBeNull();
    });

    test('it returns the filename, filetype, and path', () => {
      {
        const match = '%{./package.json}.scripts[_]'.match(FILE_RE);
        expect(match?.[1]).toEqual('./package.json');
        expect(match?.[2]).toEqual('json');
        expect(match?.[3]).toEqual('scripts[_]');
      }

      {
        const match = '%{./serverless.yml}[_]'.match(FILE_RE);
        expect(match?.[1]).toEqual('./serverless.yml');
        expect(match?.[2]).toEqual('yml');
        expect(match?.[3]).toEqual('[_]');
      }

      {
        const match = '%{./k8s.yaml}[_].kind'.match(FILE_RE);
        expect(match?.[1]).toEqual('./k8s.yaml');
        expect(match?.[2]).toEqual('yaml');
        expect(match?.[3]).toEqual('[_].kind');
      }
    });
  });
});