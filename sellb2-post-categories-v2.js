/* SELLB2 listing form v2 — stable 10-category marketplace form */
(function () {
  'use strict';

  const C = [
    { id: 'cars', name: 'Cars', fields: [['brand', 'Brand / Make', 'text', '', 1], ['model', 'Model', 'text', '', 1], ['variant', 'Variant', 'text'], ['year', 'Model year', 'number', '', 1], ['fuel', 'Fuel type', 'select', 'Petrol|Diesel|CNG|Electric|Hybrid'], ['transmission', 'Transmission', 'select', 'Manual|Automatic|AMT|CVT|DCT'], ['km', 'KM driven', 'number'], ['owners', 'Ownership count', 'number'], ['registration', 'Registration', 'select', 'Registered|Unregistered'], ['color', 'Colour', 'text'], ['insurance', 'Insurance valid till', 'date']] },
    { id: 'bikes', name: 'Bikes', fields: [['brand', 'Brand / Make', 'text', '', 1], ['model', 'Model', 'text', '', 1], ['year', 'Model year', 'number', '', 1], ['engine_cc', 'Engine CC', 'number', '', 1], ['fuel', 'Fuel type', 'select', 'Petrol|Electric|Other'], ['km', 'KM driven', 'number'], ['owners', 'Ownership count', 'number'], ['registration', 'Registration', 'select', 'Registered|Unregistered'], ['condition', 'Condition', 'select', 'New|Excellent|Good|Fair|Needs Work'], ['color', 'Colour', 'text']] },
    { id: 'electronics', name: 'Electronics', fields: [['type', 'Item type', 'select', 'Mobile Phone|Laptop|Tablet|TV|Camera|Audio|Gaming|Appliance|Other', 1], ['brand', 'Brand', 'text', '', 1], ['model', 'Model', 'text', '', 1], ['condition', 'Condition', 'select', 'New|Like New|Excellent|Good|Fair', 1], ['purchase_year', 'Purchase year', 'number'], ['warranty', 'Warranty', 'select', 'No warranty|Under warranty'], ['storage', 'Storage / capacity', 'text'], ['color', 'Colour', 'text'], ['bill', 'Bill available', 'select', 'Yes|No']] },
    { id: 'jobs', name: 'Jobs', fields: [['role', 'Job title / role', 'text', '', 1], ['employment', 'Employment type', 'select', 'Full-time|Part-time|Contract|Internship|Freelance', 1], ['workmode', 'Work mode', 'select', 'On-site|Hybrid|Remote', 1], ['experience', 'Experience required', 'text'], ['salary_min', 'Minimum salary', 'number'], ['salary_max', 'Maximum salary', 'number'], ['company', 'Company / employer', 'text', '', 1], ['vacancies', 'Vacancies', 'number'], ['education', 'Education required', 'text']] },
    { id: 'furniture', name: 'Furniture', fields: [['type', 'Furniture type', 'select', 'Sofa|Bed|Dining Table|Chair|Wardrobe|Desk|Office Furniture|Outdoor|Other', 1], ['material', 'Material', 'text'], ['condition', 'Condition', 'select', 'New|Like New|Excellent|Good|Fair', 1], ['age', 'Age', 'text'], ['dimensions', 'Dimensions', 'text'], ['color', 'Colour', 'text'], ['brand', 'Brand', 'text'], ['quantity', 'Quantity', 'number']] },
    { id: 'fashion', name: 'Fashion', fields: [['gender', 'For', 'select', 'Men|Women|Kids|Unisex', 1], ['type', 'Category', 'select', 'Clothing|Footwear|Accessories|Bags|Jewellery|Other', 1], ['brand', 'Brand', 'text'], ['size', 'Size', 'text'], ['condition', 'Condition', 'select', 'New|Like New|Excellent|Good|Fair', 1], ['material', 'Material', 'text'], ['color', 'Colour', 'text'], ['quantity', 'Quantity', 'number']] },
    { id: 'books', name: 'Books', fields: [['type', 'Book category', 'select', 'Academic|Competitive Exam|Fiction|Non-fiction|Business|Children|Comics|Other', 1], ['author', 'Author', 'text'], ['language', 'Language', 'text', '', 1], ['edition', 'Edition', 'text'], ['condition', 'Condition', 'select', 'New|Like New|Good|Fair', 1], ['publication_year', 'Publication year', 'number'], ['isbn', 'ISBN', 'text'], ['quantity', 'Quantity', 'number']] },
    { id: 'commercial', name: 'Commercial', fields: [['vehicle_type', 'Vehicle type', 'select', 'Truck|Dumper|HYVA|Tip Trailer|Pickup|Van|Tempo|Bus|Tractor|JCB / Excavator|Crane|Loader|Trailer|Tanker|Other', 1], ['brand', 'Brand / Make', 'text', '', 1], ['model', 'Model', 'text', '', 1], ['year', 'Model year', 'number', '', 1], ['wheels', 'Wheels', 'number', '', 1], ['payload', 'Payload / capacity', 'text'], ['km', 'KM driven', 'number'], ['condition', 'Condition', 'select', 'New|Excellent|Good|Fair|Needs Work', 1], ['registration', 'RC status', 'select', 'Registered|Unregistered', 1], ['fitness', 'Fitness valid till', 'date'], ['insurance', 'Insurance valid till', 'date']] },
    { id: 'realestate', name: 'Real Estate', fields: [['property_type', 'Property type', 'select', 'Apartment|Villa|House|Land|Office|Shop|Building|Warehouse|Industrial Property|Commercial Property', 1], ['listing_type', 'Listing type', 'select', 'Sale|Rent|Lease', 1], ['area', 'Area', 'number', '', 1], ['area_unit', 'Area unit', 'select', 'sqft|sqyd|sqm|acre|decimal', 1], ['bedrooms', 'Bedrooms', 'number'], ['bathrooms', 'Bathrooms', 'number'], ['floor', 'Floor', 'number'], ['total_floors', 'Total floors', 'number'], ['furnishing', 'Furnishing', 'select', 'Unfurnished|Semi-Furnished|Fully Furnished'], ['parking', 'Parking', 'select', 'None|1 Car|2 Cars|3+ Cars|Bike Parking|Covered Parking'], ['possession', 'Possession', 'select', 'Ready to Move|Under Construction|Within 3 Months|Within 6 Months|Within 1 Year'], ['facing', 'Facing', 'select', 'North|South|East|West|North-East|North-West|South-East|South-West'], ['amenities', 'Amenities', 'text']] },
    { id: 'business', name: 'Business', fields: [['business_type', 'Business type', 'select', 'Company|Shop / Retail|Restaurant|Hotel|Manufacturing|Service Business|Transport Business|Construction Business|Wholesale Business|Other Business', 1], ['established_year', 'Established year', 'number'], ['ownership', 'Ownership type', 'select', 'Sole Proprietorship|Partnership|Private Limited|LLP|Public Limited|Other'], ['employees', 'Employees', 'number'], ['gst', 'GST registered', 'select', 'Yes|No'], ['annual_revenue', 'Annual revenue', 'number'], ['annual_profit', 'Annual profit', 'number'], ['reason', 'Reason for sale', 'text'], ['assets', 'Business assets', 'text']] }
  ];

  const icons = { cars: '🚗', bikes: '🏍️', electronics: '📱', jobs: '💼', furniture: '🪑', fashion: '👕', books: '📚', commercial: '🚚', realestate: '🏠', business: '🏢' };
  const excludedIds = new Set(['pc_title', 'pc_state', 'pc_district', 'pc_city', 'pc_locality', 'pc_address', 'pc_price', 'pc_price_label', 'pc_description', 'pc_phone', 'pc_email', 'pc_files', 'pc_previews', 'pc_error']);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const locationData = () => window.EN_LOCATION || { states: [], districtsByState: {}, citiesByState: {} };

  function field(def) {
    const [id, name, type, options, required] = def;
    if (type === 'select') {
      return `<label>${name}<select id="pc_${id}" class="field" ${required ? 'required' : ''}><option value="">Select ${name}</option>${String(options || '').split('|').map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>`;
    }
    return `<label>${name}<input id="pc_${id}" class="field" type="${type}" placeholder="${type === 'number' ? 'Enter value' : ''}" ${required ? 'required' : ''}></label>`;
  }

  function categoryFields(category) {
    const item = C.find((x) => x.id === category) || C.find((x) => x.id === 'realestate');
    return item.fields.map(field).join('');
  }

  function locationFields() {
    const states = (locationData().states || []).map((x) => `<option>${esc(x)}</option>`).join('');
    return `<div class="pc-section"><h3>Location</h3><div class="grid2"><label>State<select id="pc_state" class="field" required><option value="">Select state</option>${states}</select></label><label>District<select id="pc_district" class="field" required><option value="">Select district</option></select></label><label>City<select id="pc_city" class="field" required><option value="">Select city</option></select></label><label>Locality / area<input id="pc_locality" class="field"></label><label>Full address<input id="pc_address" class="field"></label></div></div>`;
  }

  function formMarkup(category) {
    const item = C.find((x) => x.id === category) || C.find((x) => x.id === 'realestate');
    return `<label>Listing title<input id="pc_title" class="field" required placeholder="Clear listing title"></label><div class="pc-section"><h3>${item.name} information</h3><div class="grid2">${categoryFields(item.id)}</div></div>${locationFields()}<div class="pc-section"><h3>Price / compensation</h3><div class="grid2"><label>Price / asking price<input id="pc_price" class="field" type="number" ${item.id === 'jobs' ? '' : 'required'} placeholder="₹"></label><label>Price label<input id="pc_price_label" class="field" placeholder="e.g. Negotiable"></label></div></div><div class="pc-section"><h3>Description</h3><textarea id="pc_description" class="field" required placeholder="Describe the listing clearly"></textarea></div><div class="pc-section"><h3>Seller contact</h3><div class="grid2"><label>Phone number<input id="pc_phone" class="field" type="tel" required placeholder="10-digit phone"></label><label>Email address<input id="pc_email" class="field" type="email" required placeholder="seller@example.com"></label></div></div><div class="pc-section"><h3>Photos</h3><p class="formnote">Up to 12 images · max 8 MB each · first image is cover</p><input id="pc_files" class="field" type="file" accept="image/jpeg,image/png,image/webp" multiple required><div id="pc_previews" class="filepreviews"></div></div><div id="pc_error" class="error"></div><button class="btn primary full" type="submit">Publish listing</button>`;
  }

  function chooserMarkup(category) {
    return `<section class="postchooser" data-pc-version="3"><h2>What are you selling?</h2><div class="pc-cats">${C.map((x) => `<button type="button" class="${x.id === category ? 'on' : ''}" data-pc-cat="${x.id}"><i>${icons[x.id]}</i><b>${x.name}</b><small>List for sale</small></button>`).join('')}</div></section>`;
  }

  function currentCategory(form) {
    let category = form.dataset.pcCat || (window.st && C.some((x) => x.id === window.st.postCat) ? window.st.postCat : 'realestate');
    return C.some((x) => x.id === category) ? category : 'realestate';
  }

  function bindChooser(form) {
    document.querySelectorAll('[data-pc-cat]').forEach((button) => {
      button.onclick = () => {
        const next = button.dataset.pcCat;
        form.dataset.pcCat = next;
        if (window.st) window.st.postCat = next;
        render();
      };
    });
  }

  function render() {
    if (window.location.pathname !== '/post') return;
    const form = document.querySelector('form.listingform');
    const oldChooser = document.querySelector('.postchooser');
    if (!form || !oldChooser) return;

    const category = currentCategory(form);
    if (oldChooser.dataset.pcVersion !== '3') {
      oldChooser.outerHTML = chooserMarkup(category);
      bindChooser(form);
    }

    if (form.dataset.pcRendered === category) return;
    form.dataset.pcRendered = category;
    form.innerHTML = formMarkup(category);
    form.onsubmit = publish;
    bindForm();
  }

  function bindForm() {
    const state = document.getElementById('pc_state');
    const district = document.getElementById('pc_district');
    const city = document.getElementById('pc_city');
    if (state && district && city) {
      state.onchange = () => {
        const data = locationData();
        const districts = data.districtsByState[state.value] || [];
        const cities = data.citiesByState[state.value] || [];
        district.innerHTML = '<option value="">Select district</option>' + districts.map((x) => `<option>${esc(x)}</option>`).join('');
        city.innerHTML = '<option value="">Select city</option>' + cities.map((x) => `<option>${esc(x)}</option>`).join('');
      };
    }

    const files = document.getElementById('pc_files');
    const previews = document.getElementById('pc_previews');
    if (files && previews) {
      files.onchange = () => {
        previews.innerHTML = [...files.files].slice(0, 12).map((file, index) => `<div><img src="${URL.createObjectURL(file)}"><span>${index ? '' : 'Cover'}</span></div>`).join('');
      };
    }
  }

  async function publish(event) {
    event.preventDefault();
    const error = document.getElementById('pc_error');
    const button = event.submitter;
    button.disabled = true;
    error.textContent = '';
    try {
      if (!window.db || !window.st?.user) throw new Error('Please sign in first.');
      const form = document.querySelector('form.listingform');
      const category = form.dataset.pcCat || 'realestate';
      const files = [...document.getElementById('pc_files').files].slice(0, 12);
      const phone = document.getElementById('pc_phone').value.trim();
      const email = document.getElementById('pc_email').value.trim();
      if (!files.length) throw new Error('Add at least one photo.');
      if (files.some((file) => file.size > 8 * 1024 * 1024)) throw new Error('Each image must be 8 MB or smaller.');
      if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) throw new Error('Enter a valid seller phone number.');
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid seller email address.');

      const details = { marketplace_category: category, seller_contact_phone: phone, seller_contact_email: email };
      document.querySelectorAll('[id^="pc_"]').forEach((element) => {
        if (excludedIds.has(element.id)) return;
        const key = element.id.slice(3);
        const value = element.value.trim();
        if (value) details[key] = element.type === 'number' ? Number(value) : value;
      });

      const row = {
        owner_id: window.st.user.id,
        title: document.getElementById('pc_title').value.trim(),
        description: document.getElementById('pc_description').value.trim(),
        category,
        property_type: details.property_type || details.vehicle_type || details.business_type || category,
        listing_type: details.listing_type || 'sale',
        price: Number(document.getElementById('pc_price').value) || 0,
        price_label: document.getElementById('pc_price_label').value.trim() || null,
        state: document.getElementById('pc_state').value,
        district: document.getElementById('pc_district').value,
        city: document.getElementById('pc_city').value,
        locality: document.getElementById('pc_locality').value.trim(),
        address: document.getElementById('pc_address').value.trim(),
        approval_status: 'approved',
        status: 'active',
        details
      };

      if (!row.state || !row.district || !row.city) throw new Error('Please select state, district and city.');
      if (category === 'realestate') {
        row.area = Number(details.area) || null;
        row.area_unit = details.area_unit || 'sqft';
        row.bedrooms = Number(details.bedrooms) || null;
        row.bathrooms = Number(details.bathrooms) || null;
        row.furnishing = details.furnishing || null;
        row.parking = details.parking || null;
        row.possession = details.possession || null;
        row.facing = details.facing || null;
        row.amenities = (details.amenities || '').split(',').map((x) => x.trim()).filter(Boolean);
      }

      const inserted = await window.db.from('listings').insert(row).select().single();
      if (inserted.error) throw inserted.error;

      const urls = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${window.st.user.id}/${inserted.data.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await window.db.storage.from('property-images').upload(path, file, { contentType: file.type });
        if (upload.error) throw upload.error;
        const url = window.db.storage.from('property-images').getPublicUrl(path).data.publicUrl;
        urls.push(url);
        const imageRow = await window.db.from('listing_images').insert({ listing_id: inserted.data.id, storage_path: path, public_url: url, sort_order: index });
        if (imageRow.error) throw imageRow.error;
      }

      const update = await window.db.from('listings').update({ cover_image_url: urls[0], image_urls: urls }).eq('id', inserted.data.id);
      if (update.error) throw update.error;
      if (typeof window.toast === 'function') window.toast('Listing published');
      if (typeof window.setPath === 'function') window.setPath('/');
    } catch (errorValue) {
      error.textContent = errorValue?.message || 'Could not publish listing';
    } finally {
      button.disabled = false;
    }
  }

  function style() {
    if (document.getElementById('pc-style')) return;
    const styleElement = document.createElement('style');
    styleElement.id = 'pc-style';
    styleElement.textContent = `.pc-cats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}.pc-cats button{min-width:0;padding:10px 4px;border-radius:17px;display:flex;flex-direction:column;align-items:center;gap:4px}.pc-cats i{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:#eef3ff;font-style:normal;font-size:25px}.pc-cats b{font-size:11px;line-height:1.1;text-align:center}.pc-cats small{font-size:8px;color:#7b8799}.pc-section{margin:15px 0;padding:15px;border:1px solid rgba(16,46,104,.08);border-radius:18px;background:var(--surface,#fff)}.pc-section h3{margin:0 0 11px}.listingform .field{box-sizing:border-box}.listingform .grid2{gap:10px}@media(max-width:520px){.pc-cats{gap:6px}.pc-cats i{width:42px;height:42px;font-size:22px}.pc-cats b{font-size:10px}.pc-cats small{font-size:7px}}`;
    document.head.appendChild(styleElement);
  }

  style();
  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  render();
})();
