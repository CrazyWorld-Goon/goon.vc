'use strict';

const settings = require('../settings/local');
const GoonVC = require('../services/goon.vc');

const handleGoonDebug = require('../functions/handleGoonDebug');
const handleGoonError = require('../functions/handleGoonError');
const handleGoonLog = require('../functions/handleGoonLog');

async function main (input = {}) {
  const vc = new GoonVC(input);

  vc.on('debug', handleGoonDebug);
  vc.on('error', handleGoonError);
  vc.on('log', handleGoonLog);

  await vc.start();

  return {
    id: vc.id,
    name: vc.name
  };
}

main(settings).catch((exception) => {
  console.error('[GOON.VC]', '[ERROR]', exception);
  process.exitCode = 1;
}).then((output) => {
  if (output) console.log('[GOON.VC]', '[OUTPUT]', output);
});
