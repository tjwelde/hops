describe('jest preset', () => {
  it('makes babel config available and allows to use jsx', () => {
    const rendered = require('../hello').default();
    expect(rendered.props.children).toBe('Hello World');
  });

  it('mocks files', () => {
    const file = require('../image.jpg');
    expect(file).toBe('test-file-stub');
  });
});
