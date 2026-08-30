// EstateNova isolated application loader
'use strict';

window.estatenovaReady = (async function(){
  try {
    const response = await fetch('/app.js?v=estate-20260830-4', {cache:'no-store'});
    if (!response.ok) throw new Error('Failed to load EstateNova application (' + response.status + ').');
    const source = await response.text();
    const filterPatchResponse = await fetch('/search-filters-v2.js?v=estate-20260830-1', {cache:'no-store'});
    if (!filterPatchResponse.ok) throw new Error('Failed to load EstateNova search filters.');
    const filterPatch = await filterPatchResponse.text();

    // Execute the legacy client and the filter extension inside one private scope.
    // The extension intentionally shares the app's state/db/render bindings.
    (function(){
      eval(source + '\n' + filterPatch + '\nwindow.state=state; window.render=render; window.toggleSave=toggleSave; window.loadListings=loadListings;');
    })();
    return true;
  } catch (error) {
    console.error('EstateNova isolated loader failed:', error);
    window.dispatchEvent(new CustomEvent('estatenova-loader-error', {detail:error}));
    throw error;
  }
})();
