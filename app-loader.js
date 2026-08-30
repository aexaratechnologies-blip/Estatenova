// EstateNova isolated application loader
'use strict';

window.estatenovaReady = (async function(){
  try {
    const response = await fetch('/app.js?v=estate-20260830-5', {cache:'no-store'});
    if (!response.ok) throw new Error('Failed to load EstateNova application (' + response.status + ').');
    const source = await response.text();
    const locationResponse = await fetch('/location-data-v1.js?v=estate-20260830-1', {cache:'no-store'});
    if (!locationResponse.ok) throw new Error('Failed to load EstateNova location data.');
    const locationSource = await locationResponse.text();
    const filterPatchResponse = await fetch('/search-filters-v2.js?v=estate-20260830-3', {cache:'no-store'});
    if (!filterPatchResponse.ok) throw new Error('Failed to load EstateNova search filters.');
    const filterPatch = await filterPatchResponse.text();
    const sellerPatchResponse = await fetch('/seller-listing-v2.js?v=estate-20260830-2', {cache:'no-store'});
    if (!sellerPatchResponse.ok) throw new Error('Failed to load EstateNova seller listing module.');
    const sellerPatch = await sellerPatchResponse.text();
    const sellerPhotoQueueResponse = await fetch('/seller-photo-queue-v2.js?v=estate-20260830-1', {cache:'no-store'});
    if (!sellerPhotoQueueResponse.ok) throw new Error('Failed to load EstateNova seller photo queue.');
    const sellerPhotoQueuePatch = await sellerPhotoQueueResponse.text();

    // Execute all application modules in one private scope so they share the
    // same state/db/render bindings while avoiding browser-global collisions.
    (function(){
      eval(locationSource + '\n' + source + '\n' + filterPatch + '\n' + sellerPatch + '\n' + sellerPhotoQueuePatch + '\nwindow.state=state; window.render=render; window.toggleSave=toggleSave; window.loadListings=loadListings;');
    })();

    if(window.render && window.enInstallSellerPhotoQueue){
      const originalRender=window.render;
      window.render=async function(){
        const result=await originalRender.apply(this,arguments);
        window.enInstallSellerPhotoQueue();
        return result;
      };
      window.enInstallSellerPhotoQueue();
    }

    if(window.estatenovaLocationReady) await window.estatenovaLocationReady;
    return true;
  } catch (error) {
    console.error('EstateNova isolated loader failed:', error);
    window.dispatchEvent(new CustomEvent('estatenova-loader-error', {detail:error}));
    throw error;
  }
})();
