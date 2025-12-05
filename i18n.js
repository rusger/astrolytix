/**
 * Astrolytix Internationalization (i18n) Module
 *
 * Features:
 * - GeoIP-based language detection on first visit
 * - localStorage persistence for user's language preference
 * - Easy to add new languages (just add locale file and update SUPPORTED_LANGUAGES)
 * - DOM text replacement via data-i18n attributes
 */

const I18n = (function() {
    'use strict';

    // ============================================
    // CONFIGURATION - Easy to extend with new languages
    // ============================================

    // Add new languages here: { code: { name, nativeName, flag } }
    const SUPPORTED_LANGUAGES = {
        en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
        ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
        // Future languages - just add entries here:
        // es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
        // de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
        // fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
        // zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
        // ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
        // ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
        // hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
        // ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
        // pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
        // it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    };

    // Map country codes to language codes for GeoIP detection
    // Add new country mappings as you add languages
    const COUNTRY_TO_LANGUAGE = {
        // Russian-speaking countries
        RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', TJ: 'ru', UZ: 'ru', TM: 'ru',

        // Default to English for all other countries
        // When you add Spanish:
        // ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',

        // When you add German:
        // DE: 'de', AT: 'de', CH: 'de', LI: 'de', LU: 'de',

        // When you add French:
        // FR: 'fr', BE: 'fr', CA: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',

        // When you add Chinese:
        // CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
    };

    const STORAGE_KEY = 'astrolytix_language';
    const DEFAULT_LANGUAGE = 'en';
    const GEOIP_API = 'https://get.geojs.io/v1/ip/country.json';

    // ============================================
    // STATE
    // ============================================

    let currentLanguage = DEFAULT_LANGUAGE;
    let translations = {};
    let isInitialized = false;

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Get nested object value by dot-notation path
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Load translations for a specific language
     */
    async function loadTranslations(langCode) {
        try {
            const response = await fetch(`locales/${langCode}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${langCode}.json`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading translations for ${langCode}:`, error);
            // Fallback to English if available
            if (langCode !== DEFAULT_LANGUAGE) {
                return await loadTranslations(DEFAULT_LANGUAGE);
            }
            return {};
        }
    }

    /**
     * Detect language based on GeoIP
     */
    async function detectLanguageByGeoIP() {
        try {
            const response = await fetch(GEOIP_API);
            if (!response.ok) throw new Error('GeoIP request failed');

            const data = await response.json();
            const countryCode = data.country;

            if (countryCode && COUNTRY_TO_LANGUAGE[countryCode]) {
                return COUNTRY_TO_LANGUAGE[countryCode];
            }
        } catch (error) {
            console.warn('GeoIP detection failed, using default language:', error);
        }
        return DEFAULT_LANGUAGE;
    }

    /**
     * Get user's saved language preference from localStorage
     */
    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            console.warn('localStorage not available:', error);
            return null;
        }
    }

    /**
     * Save language preference to localStorage
     */
    function saveLanguage(langCode) {
        try {
            localStorage.setItem(STORAGE_KEY, langCode);
        } catch (error) {
            console.warn('Could not save language preference:', error);
        }
    }

    /**
     * Update all DOM elements with data-i18n attributes
     */
    function updateDOM() {
        // Update text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedValue(translations, key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = getNestedValue(translations, key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = getNestedValue(translations, key);
            if (translation) {
                element.title = translation;
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = currentLanguage;

        // Update page title
        const titleTranslation = getNestedValue(translations, 'meta.title');
        if (titleTranslation) {
            document.title = titleTranslation;
        }

        // Update language switcher active state
        updateLanguageSwitcher();

        // Dispatch custom event for any additional handling
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: currentLanguage }
        }));
    }

    /**
     * Update the language switcher UI to reflect current language
     */
    function updateLanguageSwitcher() {
        const currentLangSpan = document.querySelector('.language-current');
        if (currentLangSpan && SUPPORTED_LANGUAGES[currentLanguage]) {
            const lang = SUPPORTED_LANGUAGES[currentLanguage];
            currentLangSpan.innerHTML = `${lang.flag} ${lang.nativeName}`;
        }

        // Update dropdown items active state
        document.querySelectorAll('.language-option').forEach(option => {
            const langCode = option.getAttribute('data-lang');
            option.classList.toggle('active', langCode === currentLanguage);
        });
    }

    /**
     * Create the language switcher dropdown HTML
     */
    function createLanguageSwitcher() {
        const container = document.createElement('div');
        container.className = 'language-switcher';

        // Current language button
        const currentLang = SUPPORTED_LANGUAGES[currentLanguage];
        container.innerHTML = `
            <button class="language-toggle" aria-label="Select language" aria-expanded="false">
                <span class="language-current">${currentLang.flag} ${currentLang.nativeName}</span>
                <svg class="language-arrow" width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="language-dropdown">
                ${Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => `
                    <button class="language-option${code === currentLanguage ? ' active' : ''}" data-lang="${code}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.nativeName}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Event listeners
        const toggle = container.querySelector('.language-toggle');
        const dropdown = container.querySelector('.language-dropdown');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('open');
        });

        container.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async () => {
                const langCode = option.getAttribute('data-lang');
                await I18n.setLanguage(langCode);
                toggle.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('open');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            toggle.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('open');
        });

        return container;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the i18n system
         * - Checks localStorage for saved preference
         * - Falls back to GeoIP detection if no preference
         * - Loads translations and updates DOM
         */
        async init() {
            if (isInitialized) return;

            // Check for saved language preference first
            const savedLang = getSavedLanguage();

            if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
                currentLanguage = savedLang;
            } else {
                // No saved preference, detect by GeoIP
                currentLanguage = await detectLanguageByGeoIP();
                // Don't save GeoIP result - only save explicit user choice
            }

            // Load translations
            translations = await loadTranslations(currentLanguage);

            // Insert language switcher into navbar
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const switcherLi = document.createElement('li');
                switcherLi.appendChild(createLanguageSwitcher());
                navLinks.appendChild(switcherLi);
            }

            // Update DOM with translations
            updateDOM();

            isInitialized = true;
        },

        /**
         * Set the current language
         * @param {string} langCode - The language code (e.g., 'en', 'ru')
         */
        async setLanguage(langCode) {
            if (!SUPPORTED_LANGUAGES[langCode]) {
                console.error(`Language "${langCode}" is not supported`);
                return false;
            }

            if (langCode === currentLanguage) return true;

            currentLanguage = langCode;
            saveLanguage(langCode); // Save user's explicit choice
            translations = await loadTranslations(langCode);
            updateDOM();

            return true;
        },

        /**
         * Get a translation by key
         * @param {string} key - Dot-notation key (e.g., 'nav.home')
         * @param {object} params - Optional parameters for interpolation
         */
        t(key, params = {}) {
            let translation = getNestedValue(translations, key);

            if (!translation) {
                console.warn(`Translation not found for key: ${key}`);
                return key;
            }

            // Simple parameter interpolation: {{paramName}}
            if (params && typeof translation === 'string') {
                Object.entries(params).forEach(([param, value]) => {
                    translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
                });
            }

            return translation;
        },

        /**
         * Get the current language code
         */
        getCurrentLanguage() {
            return currentLanguage;
        },

        /**
         * Get all supported languages
         */
        getSupportedLanguages() {
            return { ...SUPPORTED_LANGUAGES };
        },

        /**
         * Check if a language is supported
         */
        isSupported(langCode) {
            return langCode in SUPPORTED_LANGUAGES;
        }
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}
