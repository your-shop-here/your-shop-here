document.addEventListener('DOMContentLoaded', () => {
    if (!document.cookie.includes('ysh_dnt=')) {
        const cookieConsentElement = document.getElementById('cookie-consent-check');
        if (cookieConsentElement && window.htmx) {
            htmx.trigger('#cookie-consent-check', 'cookie-consent-check');
        }
    }
});
