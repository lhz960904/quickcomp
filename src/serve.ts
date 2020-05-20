// @ts-ignore
import storybook from '@storybook/react/standalone';
import generator from './sotrybook/generator';

export default function serve() {
  const { storybookPath } = generator(process.cwd());
  storybook({
    mode: 'dev',
    port: 9001,
    configDir: storybookPath,
  });
}
