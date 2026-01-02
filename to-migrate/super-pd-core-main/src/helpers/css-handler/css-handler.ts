import { mapCssValues } from './cssBuilder';
import styleToCss from 'style-object-to-css-string';
import json2mq from 'json2mq';

/**
 * Css handler to build css from configuration
 * @param {Object} breakpointsConfig
 */
export default class CssHandler {
    breakpointsConfig;

    constructor(breakpointsConfig: any) {
        this.breakpointsConfig = breakpointsConfig;
    }

    getCssBlock (cssSelector: string, config: any) {
        const cssObject = mapCssValues(config);
        const cssString = styleToCss(cssObject);
    
        if (!cssString) return '';
    
        return `${cssSelector} {\n${cssString}\n}\n`;
    };

    getBreakpointBlock (cssSelector: string, breakpoint: string, config: any) {
        const cssString = this.getCssBlock(cssSelector, config);
    
        if (!cssString) return '';
    
        if (breakpoint === 'default') {
            return cssString;
        }
    
        const mediaQuery = json2mq(this.breakpointsConfig[breakpoint]);
        return `@media ${mediaQuery} {\n${cssString}\n}\n`;
    };

    getRawCss (cssSelector: string, config: any) {
        const breakpoints = ['default', 'mobile', 'tablet', 'desktop'];
        let rawCss = '';
    
        for (const breakpoint of breakpoints) {
            const breakpointConfig = config.breakpoints[breakpoint];
            rawCss += this.getBreakpointBlock(cssSelector, breakpoint, breakpointConfig);
        }
    
        return rawCss;
    };
}
