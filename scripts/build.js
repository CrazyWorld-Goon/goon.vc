'use strict';

const path = require('path');

const settings = require('../settings/local');
const HTMLCompiler = require('../types/HTMLCompiler');

async function main (input = {}) {
  const compiler = new HTMLCompiler(input);
  const target = path.resolve(__dirname, '..', 'assets', 'index.html');
  await compiler.compileTo(target);
  return { target };
}

main(settings).catch((exception) => {
  console.error('[BUILD:SITE]', '[EXCEPTION]', exception);
  process.exitCode = 1;
}).then((output) => {
  if (output) console.log('[BUILD:SITE]', '[OUTPUT]', output);
});
