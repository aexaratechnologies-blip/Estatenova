// EstateNova isolated application loader
'use strict';

window.estatenovaReady = (async function(){
  try {
    const response = await fetch('/app.js?v=estate-20260830-5', {cache:'no-store'});
    if (!response.ok) throw new Error('Failed to load EstateNova application (' + response.status + ').');
    const source = await response.text();
    const filterPatchResponse = await fetch('/search-filters-v2.js?v=estate-20260830-2', {cache:'no-store'});
    if (!filterPatchResponse.ok) throw new Error('Failed to load EstateNova search filters.');
    const filterPatch = await filterPatchResponse.text();
    const sellerPatchResponse = await fetch('/seller-listing-v2.js?v=estate-20260830-1', {cache:'no-store'});
    if (!sellerPatchResponse.ok) throw new Error('Failed to load EstateNova seller listing module.');
    const sellerPatch = await sellerPatchResponse.text();

    // Execute all application modules in one private scope so they share the
    // same state/db/render bindings while avoiding browser-global collisions.
    (function(){
      eval(source + '\n' + filterPatch + '\n' + sellerPatch + '\nwindow.state=state; window.render=render; window.toggleSave=toggleSave; window.loadListings=loadListings;');
    })();
    return true;
  } catch (error) {
    console.error('EstateNova isolated loader failed:', error);
    window.dispatchEvent(new CustomEvent('estatenova-loader-error', {detail:error}));
    throw error;
  }
})();
