'use strict';

// SELLB2 compatibility loader. Legacy application boot is disabled.
// index.html owns the SELLB2 startup sequence.
window.sellb2LoaderReady = Promise.resolve(true);
window.sellb2LegacyDisabled = true;
