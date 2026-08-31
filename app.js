'use strict';

// SELLB2 compatibility entrypoint.
// Production UI and application logic live in sellb2.js.
// Keeping this legacy path inert prevents the retired application from being loaded.
window.SELLB2_APP = true;
