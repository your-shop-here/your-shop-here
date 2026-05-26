function createModel(params) {
    return {
        regions: params.regions,
        copyrightText: params.copyrightText,
        newsletterHeading: params.newsletterHeading,
        newsletterSubtext: params.newsletterSubtext,
        facebookUrl: params.facebookUrl,
        instagramUrl: params.instagramUrl,
        twitterUrl: params.twitterUrl,
        pinterestUrl: params.pinterestUrl,
        youtubeUrl: params.youtubeUrl,
    };
}

function template(model) {
    return `<div class="ysh-footer">
        <div class="ysh-footer__main container">
            <div class="ysh-footer__newsletter">
                <p class="ysh-footer__newsletter-heading">${model.newsletterHeading}</p>
                <p class="ysh-footer__newsletter-subtext">${model.newsletterSubtext}</p>
                <form class="ysh-footer__newsletter-form" action="#" method="post">
                    <input type="email" name="email" placeholder="Enter your email" aria-label="Email address" required />
                    <button type="submit">Sign Up</button>
                </form>
                <div class="ysh-footer__social">
                    <a href="${model.facebookUrl}" aria-label="Facebook" class="ysh-footer__social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="${model.instagramUrl}" aria-label="Instagram" class="ysh-footer__social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="${model.twitterUrl}" aria-label="Twitter / X" class="ysh-footer__social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="${model.pinterestUrl}" aria-label="Pinterest" class="ysh-footer__social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                    </a>
                    <a href="${model.youtubeUrl}" aria-label="YouTube" class="ysh-footer__social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                </div>
            </div>

            <div class="ysh-footer__nav">
                ${model.regions.col1.setTagName('div', true).setClassName('ysh-footer__col').render()}
                ${model.regions.col2.setTagName('div', true).setClassName('ysh-footer__col').render()}
                ${model.regions.col3.setTagName('div', true).setClassName('ysh-footer__col').render()}
                ${model.regions.col4.setTagName('div', true).setClassName('ysh-footer__col').render()}
            </div>
        </div>

        <div class="ysh-footer__bottom">
            <div class="container ysh-footer__bottom-inner">
                <span class="ysh-footer__copyright">${model.copyrightText.replace(/\n/g, '<br>')}</span>
                <nav class="ysh-footer__legal-links ysh-footer__legal-links--horizontal">
                    ${model.regions.legal.setTagName('div', false).setClassName('').render()}
                </nav>
            </div>
        </div>
    </div>`;
}

exports.createModel = createModel;
exports.template = template;
