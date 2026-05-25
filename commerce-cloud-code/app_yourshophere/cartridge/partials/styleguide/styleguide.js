exports.createModel = () => ({});

exports.template = () => {
    var brandSwatches = [
        swatch('--skin-primary-color-1',   'Primary'),
        swatch('--skin-secondary-color-1', 'Secondary'),
        swatch('--skin-accent-color-1',    'Accent'),
    ].join('');

    var textSwatches = [
        swatch('--skin-main-text-color-1', 'Text Primary'),
        swatch('--skin-text-secondary-1',  'Text Secondary'),
        swatch('--skin-text-muted-1',      'Text Muted'),
        swatch('--skin-text-light-1',      'Text Light', true),
    ].join('');

    var bgSwatches = [
        swatch('--skin-bg-primary',   'BG Primary'),
        swatch('--skin-bg-secondary', 'BG Secondary'),
        swatch('--skin-bg-tertiary',  'BG Tertiary'),
        swatch('--skin-bg-dark-1',    'BG Dark', true),
    ].join('');

    var borderSwatches = [
        swatch('--skin-border-color-1',       'Border Default'),
        swatch('--skin-border-color-hover-1', 'Border Hover'),
    ].join('');

    var spacingBoxes = ['xs', 'sm', 'md', 'lg', 'xl'].map(function(name) {
        var vals = { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' };
        return '<div style="text-align:center">'
            + '<div style="background:var(--skin-primary-color-1);width:var(--skin-spacing-' + name + ');height:var(--skin-spacing-' + name + ');margin:0 auto var(--skin-spacing-xs)"></div>'
            + '<small style="color:var(--skin-text-secondary-1)">' + name + '<br>' + vals[name] + '</small>'
            + '</div>';
    }).join('');

    var radiusBoxes = [
        { name: 'sm', val: '4px' }, { name: 'md', val: '8px' },
        { name: 'lg', val: '12px' }, { name: 'full', val: '9999px' },
    ].map(function(r) {
        return '<div style="text-align:center">'
            + '<div style="background:var(--skin-bg-tertiary);border:2px solid var(--skin-border-color-1);'
            + 'width:60px;height:60px;border-radius:var(--skin-border-radius-' + r.name + ');margin:0 auto var(--skin-spacing-xs)"></div>'
            + '<small style="color:var(--skin-text-secondary-1)">' + r.name + '<br>' + r.val + '</small>'
            + '</div>';
    }).join('');

    var shadowBoxes = ['sm', 'md', 'lg'].map(function(name) {
        return '<div style="text-align:center">'
            + '<div style="background:var(--skin-bg-primary);width:80px;height:80px;'
            + 'box-shadow:var(--skin-shadow-' + name + ');border-radius:var(--skin-border-radius-md);'
            + 'margin:var(--skin-spacing-sm) auto var(--skin-spacing-xs)"></div>'
            + '<small style="color:var(--skin-text-secondary-1)">shadow-' + name + '</small>'
            + '</div>';
    }).join('');

    var productTiles = [1, 2, 3].map(function(i) {
        return '<article class="product-tile">'
            + '<header><a href="#">Sample Product Name — Long Title That Wraps</a></header>'
            + '<img src="https://placehold.co/400x400/e8eaed/5f6368?text=Product+' + i + '" alt="Product ' + i + '" />'
            + '<div class="price">€ 99,00</div>'
            + '<div class="swatches"></div>'
            + '<footer><button>Add to Cart</button></footer>'
            + '</article>';
    }).join('');

    return /* html */`
<div class="container" style="padding:var(--skin-spacing-xl) var(--skin-spacing-md)">
    <h1>Design System</h1>
    <p style="color:var(--skin-text-secondary-1);margin-bottom:var(--skin-spacing-xl)">
        Live reference for design tokens, base elements, and UI components.
    </p>

    <section>
        <h2>Colours</h2>
        <h3>Brand</h3>
        <div style="display:flex;gap:var(--skin-spacing-md);flex-wrap:wrap;margin-bottom:var(--skin-spacing-lg)">${brandSwatches}</div>
        <h3>Text</h3>
        <div style="display:flex;gap:var(--skin-spacing-md);flex-wrap:wrap;margin-bottom:var(--skin-spacing-lg)">${textSwatches}</div>
        <h3>Backgrounds</h3>
        <div style="display:flex;gap:var(--skin-spacing-md);flex-wrap:wrap;margin-bottom:var(--skin-spacing-lg)">${bgSwatches}</div>
        <h3>Borders</h3>
        <div style="display:flex;gap:var(--skin-spacing-md);flex-wrap:wrap;margin-bottom:var(--skin-spacing-xl)">${borderSwatches}</div>
    </section>

    <hr />

    <section>
        <h2>Typography</h2>
        <div style="margin-bottom:var(--skin-spacing-xl)">
            <h1>Heading 1 — 2rem / 700</h1>
            <h2>Heading 2 — 1.75rem / 700</h2>
            <h3>Heading 3 — 1.5rem / 700</h3>
            <h4>Heading 4 — 1.25rem / 700</h4>
            <h5>Heading 5 — 1.125rem / 700</h5>
            <h6>Heading 6 — 1rem / 700</h6>
            <p>Body text — <strong>bold</strong>, <em>italic</em>, <small>small</small>, <a href="#">link</a>.</p>
            <p style="color:var(--skin-text-secondary-1)">Secondary text colour — supporting copy.</p>
            <p style="color:var(--skin-text-muted-1)">Muted text — labels, timestamps, helper text.</p>
        </div>
    </section>

    <hr />

    <section>
        <h2>Spacing</h2>
        <div style="display:flex;gap:var(--skin-spacing-md);align-items:flex-end;flex-wrap:wrap;margin-bottom:var(--skin-spacing-xl)">${spacingBoxes}</div>
    </section>

    <hr />

    <section>
        <h2>Border Radius</h2>
        <div style="display:flex;gap:var(--skin-spacing-lg);flex-wrap:wrap;margin-bottom:var(--skin-spacing-xl)">${radiusBoxes}</div>
    </section>

    <hr />

    <section>
        <h2>Shadows</h2>
        <div style="display:flex;gap:var(--skin-spacing-xl);flex-wrap:wrap;margin-bottom:var(--skin-spacing-xl)">${shadowBoxes}</div>
    </section>

    <hr />

    <section>
        <h2>Buttons</h2>
        <div style="display:flex;gap:var(--skin-spacing-md);flex-wrap:wrap;align-items:center;margin-bottom:var(--skin-spacing-xl)">
            <button>Primary</button>
            <button class="btn-secondary">Secondary</button>
            <button disabled>Disabled</button>
            <a href="#" role="button">Link Button</a>
        </div>
    </section>

    <hr />

    <section>
        <h2>Form Elements</h2>
        <div style="max-width:480px;margin-bottom:var(--skin-spacing-xl)">
            <label>Text input</label>
            <input type="text" placeholder="Placeholder text" />
            <label>Email input</label>
            <input type="email" placeholder="you@example.com" />
            <label>Invalid input</label>
            <input type="text" aria-invalid="true" value="Bad value" />
            <small class="form-field-invalid">This field is required.</small>
            <label>Select</label>
            <select><option>Option A</option><option>Option B</option><option>Option C</option></select>
            <label>Textarea</label>
            <textarea rows="3" placeholder="Your message…"></textarea>
            <label><input type="checkbox" checked /> Checkbox (checked)</label>
            <label><input type="radio" name="sg-radio" checked /> Radio A</label>
            <label><input type="radio" name="sg-radio" /> Radio B</label>
        </div>
    </section>

    <hr />

    <section>
        <h2>Product Tile</h2>
        <div class="grid desktop-cols-3 mobile-cols-2" style="margin-bottom:var(--skin-spacing-xl)">${productTiles}</div>
    </section>

    <hr />

    <section>
        <h2>Feedback</h2>
        <div style="max-width:600px;margin-bottom:var(--skin-spacing-xl)">
            <div class="error-message"><p>Something went wrong. Please try again.</p></div>
            <div class="promo-code-error"><p>Invalid promo code entered.</p></div>
        </div>
    </section>

    <hr />

    <section>
        <h2>Table</h2>
        <div style="margin-bottom:var(--skin-spacing-xl)">
            <table class="order-history-table">
                <thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                    <tr><td>00001234</td><td>24 May 2026</td><td>Shipped</td><td>€ 189,00</td></tr>
                    <tr><td>00001235</td><td>20 May 2026</td><td>Processing</td><td>€ 49,90</td></tr>
                </tbody>
            </table>
        </div>
    </section>
</div>`;
};

function swatch(variable, label, darkBg) {
    var textColor = darkBg ? 'var(--skin-text-light-1)' : 'var(--skin-main-text-color-1)';
    return '<div style="text-align:center">'
        + '<div style="background:var(' + variable + ');width:80px;height:80px;'
        + 'border-radius:var(--skin-border-radius-md);border:1px solid var(--skin-border-color-1);'
        + 'margin:0 auto var(--skin-spacing-xs)"></div>'
        + '<small style="color:' + textColor + ';font-size:0.7rem;display:block;max-width:80px">'
        + label + '<br><code style="font-size:0.65rem">' + variable + '</code></small>'
        + '</div>';
}
