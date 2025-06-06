/**
 * Forwards Facebool Pixels main window calls to Partytown's worker thread.
 *
 * https://developers.facebook.com/docs/facebook-pixel/get-started
 *
 * @public
 */
export declare const facebookPixelForward: PartytownForwardProperty[];

/**
 * Forwards Freshpaint.io main window calls to Partytown's worker thread.
 *
 * https://www.freshpaint.io/
 *
 * @public
 */
export declare const freshpaintForward: PartytownForwardProperty[];

/**
 * Forwards Google Tag Manager main window calls to Partytown's worker thread.
 *
 * @public
 */
export declare const googleTagManagerForward: PartytownForwardProperty[];

/**
 * A forward property to patch on `window`. The forward config property is an string,
 * representing the call to forward, such as `dataLayer.push` or `fbq`.
 *
 * https://partytown.qwik.dev/forwarding-events
 *
 * @public
 */
declare type PartytownForwardProperty = string | PartytownForwardPropertyWithSettings;

/**
 * @public
 */
declare type PartytownForwardPropertySettings = {
    preserveBehavior?: boolean;
};

/**
 * @public
 */
declare type PartytownForwardPropertyWithSettings = [string, PartytownForwardPropertySettings?];

export { }
