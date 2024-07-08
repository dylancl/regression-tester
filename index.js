const countryLanguageCodes = {
  'fr/fr': {
    pretty: 'France',
    hasLexus: true,
    nmsc: 'TFR',
  },
  'es/es': {
    pretty: 'Spain',
    hasLexus: true,
    nmsc: 'TES',
  },
  'se/sv': {
    pretty: 'Sweden',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TSW',
  },
  'dk/da': {
    pretty: 'Denmark',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TDK',
  },
  'fi/fi': {
    pretty: 'Finland',
    hasLexus: true,
    nmsc: 'TAF',
  },
  'be/nl': {
    pretty: 'Belgium (Dutch)',
    nmsc: 'TBEL',
  },
  'be/fr': {
    pretty: 'Belgium (French)',
    nmsc: 'TBEL',
  },
  'be/lu': {
    pretty: 'Belgium (Luxembourg)',
    nmsc: 'TBEL',
  },
  'gr/el': {
    pretty: 'Greece',
    nmsc: 'THEL',
  },
  'it/it': {
    pretty: 'Italy',
    hasLexus: true,
    nmsc: 'TMI',
  },
  'ro/ro': {
    pretty: 'Romania',
    hasStock: true,
    nmsc: 'TROM',
  },
  'bg/bg': {
    pretty: 'Bulgaria',
    hasStock: true,
    nmsc: 'TBG',
  },
  'tr/tr': {
    pretty: 'Turkey',
    nmsc: 'TTMS',
  },
  'de/de': {
    pretty: 'Germany',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TDG',
  },
  'si/sl': {
    pretty: 'Slovenia',
    nmsc: 'TAD',
  },
  'rs/sr': {
    pretty: 'Serbia',
    nmsc: 'TAD',
  },
  'hr/hr': {
    pretty: 'Croatia',
    nmsc: 'TAD',
  },
  'ba/hr': {
    pretty: 'Bosnia and Herzegovina',
    nmsc: 'TAD',
  },
  'ee/et': {
    pretty: 'Estonia',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'lv/lv': {
    pretty: 'Latvia',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'lt/lt': {
    pretty: 'Lithuania',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'az/az': {
    pretty: 'Azerbaijan',
    nmsc: 'TCA',
  },
  'ge/ka': {
    pretty: 'Georgia',
    nmsc: 'TCA',
  },
  'is/is': {
    pretty: 'Iceland',
    nmsc: 'TIC',
  },
  'cy/en': {
    pretty: 'Cyprus',
    nmsc: 'TCY',
  },
};

const [
  url,
  nextButton,
  previousButton,
  iframe,
  iframeLoadingSpinner,
  countryLanguageCode,
  notification,
  hamburger,
  sidebar,
] = [
  'url',
  'next',
  'prev',
  'iframe',
  'loading-indicator',
  'countryLanguageCode',
  'notification',
  'hamburger',
  'controls',
].map((id) => document.getElementById(id));

let currentCountryIndex = 0;

/**
 * Populate the countryLanguageCode dropdown
 */
const populateDropdown = () => {
  // Group by NMSC
  const nmscGroups = {};
  Object.keys(countryLanguageCodes).forEach((key) => {
    const nmsc = countryLanguageCodes[key].nmsc;
    if (!nmscGroups[nmsc]) {
      nmscGroups[nmsc] = [];
    }
    nmscGroups[nmsc].push(key);
  });

  // Populate the dropdown
  Object.keys(nmscGroups).forEach((nmsc) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = nmsc;
    nmscGroups[nmsc].forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.text = countryLanguageCodes[key].pretty;
      optgroup.appendChild(option);
    });
    countryLanguageCode.appendChild(optgroup);
  });

  // Set the default value
  countryLanguageCode.value = Object.keys(countryLanguageCodes)[0];
};

/**
 * Attach a change listener to the element
 * @param {HTMLElement} element
 * @param {Function} callback
 * @returns {void}
 */
const attachChangeListener = (element, callback) => {
  element.addEventListener('change', callback);
};

/**
 * Attach an event listener to the element
 * @param {HTMLElement} element
 * @param {string} event
 * @param {Function} callback
 * @returns {void}
 */
const attachEventListener = (element, event, callback) => {
  element.addEventListener(event, callback);
};

/**
 * Common callback for most change events
 */
const commonCallback = () => {
  const generatedUrl = generateUrl();
  countryLanguageCode.value =
    Object.keys(countryLanguageCodes)[currentCountryIndex];
  url.innerHTML = generatedUrl;
  iframe.src = generatedUrl;
};

/**
 * Retrieves the selected options
 * @returns {Object.<string, HTMLSelectElement>}
 */
const getSelectedOptions = () => {
  const elements = [
    'environment',
    'component',
    'uscContext',
    'uscEnv',
    'brand',
  ];

  checkOptions();

  /**
   * @type {Object.<string, string>}
   */
  const selectedOptions = {};

  elements.forEach((element) => {
    selectedOptions[element] = document.getElementById(element).value;
  });

  return selectedOptions;
};

/**
 * Disables the brand/uscContext dropdowns based on the countryLanguageCode map
 */
const setDisabledOptions = () => {
  const selectedCountryLanguageCode = countryLanguageCode.value;
  const hasLexus = countryLanguageCodes[selectedCountryLanguageCode]?.hasLexus;
  const hasStock = countryLanguageCodes[selectedCountryLanguageCode]?.hasStock;

  document.getElementById('brand').disabled = !hasLexus;
  document.getElementById('uscContext').disabled = !hasStock;
};

/**
 * When using next/previous, it's possible that the selected countryLanguageCode
 * is not available with the current options. If this is the case, reset the options
 * to the default ones.
 */
const checkOptions = () => {
  const selectedCountryLanguageCode =
    Object.keys(countryLanguageCodes)[currentCountryIndex];
  const hasLexus = countryLanguageCodes[selectedCountryLanguageCode]?.hasLexus;
  const hasStock = countryLanguageCodes[selectedCountryLanguageCode]?.hasStock;
  const [brand, uscContext] = [
    document.getElementById('brand').value,
    document.getElementById('uscContext').value,
  ];

  if (!hasLexus && brand !== 'toyota') {
    showNotification(
      'Lexus is not available for this country, resetting to Toyota'
    );
    document.getElementById('brand').value = 'toyota';
  }

  if (!hasStock && uscContext !== 'used') {
    showNotification(
      'Stock Cars is not set up for this country, resetting to Used'
    );
    document.getElementById('uscContext').value = 'used';
  }
};

/**
 * Builds the query string for the URL based on the selected options
 *
 * @param {Object.<string, string>} selectedOptions
 * @returns {string}
 */
const buildQueryString = (selectedOptions) => {
  const queryString = Object.keys(selectedOptions)
    .map((key) => `${key}=${selectedOptions[key]}`)
    .join('&');
  return queryString;
};

const generateUrl = () => {
  const {
    component: selectedComponent,
    environment: selectedEnvironment,
    ...rest
  } = getSelectedOptions();

  checkOptions();

  let environmentString;
  let url;
  const selectedCountryLanguageCode =
    Object.keys(countryLanguageCodes)[currentCountryIndex];

  switch (selectedEnvironment) {
    case 'localhost':
      url = `http://localhost:5001/${selectedCountryLanguageCode}`;
      break;
    case 'dev':
    case 'acc':
    case 'prev':
      environmentString = `${selectedEnvironment}`;
      url = `https://usc-webcomponents${environmentString}.toyota-europe.com/${selectedCountryLanguageCode}`;
      break;
    case 'prod':
      url = `https://usc-webcomponents.toyota-europe.com/${selectedCountryLanguageCode}`;
      break;
  }

  switch (selectedComponent) {
    case 'car-filter':
      url += `/car-filter?${buildQueryString(rest)}`;
      break;
    case 'used-stock-cars':
      url += `/used-stock-cars?authorPreview=true&${buildQueryString(rest)}`;
      break;
    case 'used-stock-cars-v2':
      url += `/used-stock-cars-v2?authorPreview=true&${buildQueryString(rest)}`;
      break;
  }

  return url;
};

/**
 * Sets the URL in the iframe
 * @param {string} urlToSet
 * @returns {void}
 */
const setUrl = (urlToSet) => {
  url.innerHTML = urlToSet;
  iframe.src = urlToSet;
  countryLanguageCode.value =
    Object.keys(countryLanguageCodes)[currentCountryIndex];
  iframeLoadingSpinner.style.display = 'block';
  iframe.style.display = 'none';
};

/**
 * Set the next URL in the iframe
 */
const setNextUrl = () => {
  currentCountryIndex++;
  if (currentCountryIndex >= countryLanguageCodes.length) {
    showNotification("No more countries available - can't go forward.");
    currentCountryIndex--; // Reset the index to the last valid value
    return;
  }
  const url = generateUrl();
  setUrl(url);
};

const setPreviousUrl = () => {
  currentCountryIndex--;
  if (currentCountryIndex < 0) {
    showNotification("First country - can't go back.");
    currentCountryIndex++; // Reset the index to the last valid value
    return;
  }
  const url = generateUrl();
  setUrl(url);
};

/**
 * Sets the URL based on the selected countryLanguageCode
 */
const setCountryLanguageCode = () => {
  currentCountryIndex = Object.keys(countryLanguageCodes).findIndex(
    (key) => key === countryLanguageCode.value
  );
  const url = generateUrl();
  setUrl(url);
};

/**
 * Show a notification for 3 seconds
 * @param {string} text
 * @returns {void}
 */
const showNotification = (text) => {
  notification.innerHTML = text;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
};

attachChangeListener(environment, commonCallback);
attachChangeListener(component, commonCallback);
attachChangeListener(uscContext, commonCallback);
attachChangeListener(uscEnv, commonCallback);
attachChangeListener(brand, commonCallback);
attachChangeListener(countryLanguageCode, setCountryLanguageCode);

attachEventListener(nextButton, 'click', setNextUrl);
attachEventListener(previousButton, 'click', setPreviousUrl);
attachEventListener(url, 'click', () => {
  const text = url.textContent;
  navigator.clipboard
    .writeText(text)
    .then(showNotification('URL copied to clipboard'));
});

iframe.addEventListener('load', () => {
  iframeLoadingSpinner.style.display = 'none'; // Hide the indicator
  iframe.style.display = 'block'; // Show the iframe
  setDisabledOptions();
});
attachEventListener(hamburger, 'click', () => {
  sidebar.classList.toggle('active');
});

/**
 * Set the initial URL on page load
 */
populateDropdown();
const firstUrl = generateUrl();
countryLanguageCode.value =
  Object.keys(countryLanguageCodes)[currentCountryIndex];
url.innerHTML = firstUrl;
iframe.src = firstUrl;
