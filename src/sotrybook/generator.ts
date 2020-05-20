import { ensureDirSync, writeFileSync } from 'fs-extra';
import { join, basename } from 'path';
import { sync } from 'glob';
import { camelCase } from '../utils';

const STORYBOOK_FOLDER = '.storybook';

const mainContent = `
const path = require('path');

module.exports = {
  stories: ['./index.js'],
  addons: ['@storybook/addon-actions'],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        'ts-loader',
        {
          loader: 'react-docgen-typescript-loader',
          options: {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) => {
              if (prop.parent) {
                return !prop.parent.fileName.includes('node_modules');
              }
              return true;
            },
          },
        },
      ],
    });
    config.module.rules.push({
      test: /\.less$/,
      use: ['style-loader', 'css-loader', 'less-loader'],
    });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
`;

const previewContent = `
import { addDecorator } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withConsole } from '@storybook/addon-console';
import React from 'react';

const h1Style = {
  margin: '20px 0',
  padding: '0 0 5px 0',
  fontSize: '25px',
  borderBottom: '1px solid #EEE',
};

const titleStyle = {
  fontFamily: 'Helvetica Neue, Helvetica, Segoe UI, Arial, freesans, sans-serif',
  padding: '0 40px',
};

const withTitle = (storyFn) => (
  <>
    <div style={titleStyle}>
      <h1 style={h1Style}>Examples</h1>
    </div>
    {storyFn()}
  </>
);

addDecorator(
  withInfo({
    header: false,
    inline: true,
    styles: {
      infoBody: {
        padding: '0 40px',
      },
      infoStory: {
        padding: '0 40px 0 40px',
      },
      propTableHead: {
        display: 'none',
      },
      source: {
        h1: h1Style,
      },
    },
  }),
);

addDecorator(withTitle);
addDecorator((storyFn, context) => withConsole()(storyFn)(context));
`;

export default function generateFiles(projectPath: string) {
  const tempStorybookPath = join(projectPath, STORYBOOK_FOLDER);
  const exportString: string[] = [];

  const files = sync(join(projectPath, 'examples/*.@(js|ts|jsx|tsx)'), {});
  const fileNames = files.map((fileName) =>
    fileName
      .split('/')
      .pop()
      ?.replace(/\.(jsx?|tsx?)$/, '')
  );

  fileNames.forEach((fileName) => {
    if (!fileName) return;
    const ComponentName = camelCase(fileName);
    exportString.push(`export { default as ${ComponentName} } from '../examples/${fileName}';`);
  });

  const IndexContent = `
    export default {
      title: '${camelCase(basename(projectPath))}',
    }
    ${exportString.join('\n')}
  `;

  ensureDirSync(tempStorybookPath);
  writeFileSync(join(tempStorybookPath, 'index.js'), IndexContent, 'utf8');
  writeFileSync(join(tempStorybookPath, 'main.js'), mainContent, 'utf8');
  writeFileSync(join(tempStorybookPath, 'preview.js'), previewContent, 'utf8');

  return {
    storybookPath: tempStorybookPath,
  };
}
