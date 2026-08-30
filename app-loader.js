// EstateNova isolated application loader
'use strict';

window.estatenovaReady = (async function(){
  try {
    const response = await fetch('/app.js?v=estate-20260830-3', {cache:'no-store'});
    if (!response.ok) throw new Error('Failed to load EstateNova application (' + response.status + ').');
    const source = await response.text();

    // Execute the legacy client inside a private function scope. This prevents
    // its top-level `state` binding from colliding with browser/global scripts.
    // The app uses inline HTML handlers, so expose only the bindings they need.
    (function(){
      eval(source + '\nwindow.state=state; window.render=render; window.toggleSave=toggleSave; window.loadListings=loadListings;');
    })();
    return true;
  } catch (error) {
    console.error('EstateNova isolated loader failed:', error);
    window.dispatchEvent(new CustomEvent('estatenova-loader-error', {detail:error}));
    throw error;
  }
})();
