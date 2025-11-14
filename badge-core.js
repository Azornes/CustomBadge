/**
 * Custom Badge Generator - Core Module
 * Shared code for both Node.js (generate-badge.js) and browser (docs/badge-generator.js)
 * Works in both environments using Universal Module Definition pattern
 */

(function(root, factory) {
    // Universal Module Definition (UMD) pattern
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = factory();
    } else {
        // Browser
        root.BadgeCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // Colors
    const HEADER_BG = '#1f2937';  // gray-800
    const DIGIT_BG = '#3b82f6';   // blue-500
    const TEXT_COLOR = '#ffffff'; // white

    // Eye icon (SVG path)
    const EYE_ICON = `<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" fill="none"/>`;

    /**
     * Generates SVG badge with number of views
     * @param {number} views - Number of views to display
     * @returns {string} - SVG content as string
     */
    function generateBadgeSVG(views) {
        const viewsString = String(views);
        const numDigits = viewsString.length;
        
        // Dimensions (narrower version)
        const width = 40;
        const headerHeight = 40;
        const digitHeight = 32;
        const totalHeight = headerHeight + (numDigits * digitHeight);
        const cornerRadius = 4;
        
        // Start SVG
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Profile Views">
  <title>GitHub Profile Views: ${views}</title>
  
  <!-- Header with Eye icon (rounded top) -->
  <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="${HEADER_BG}" rx="${cornerRadius}" ry="${cornerRadius}"/>
  <rect x="0" y="${cornerRadius}" width="${width}" height="${headerHeight - cornerRadius}" fill="${HEADER_BG}"/>
  
  <!-- Eye icon (adjusted for narrower width) -->
  <g transform="translate(4, 4)">
    <svg width="32" height="32" viewBox="0 0 24 24">
      ${EYE_ICON}
    </svg>
  </g>
  
 `;

        // Generate digits
        let currentY = headerHeight;
        for (let i = 0; i < numDigits; i++) {
            const digit = viewsString[i];
            const isLast = i === numDigits - 1;
            
            // Digit background
            if (isLast) {
                // Last digit - rounded corners at bottom
                svg += `  <!-- Digit ${digit} (last) -->
  <rect x="0" y="${currentY}" width="${width}" height="${digitHeight}" fill="${DIGIT_BG}" rx="${cornerRadius}" ry="${cornerRadius}"/>
  <!-- Cover top rounded corners -->
  <rect x="0" y="${currentY}" width="${width}" height="${digitHeight - cornerRadius}" fill="${DIGIT_BG}"/>
  
 `;
            } else {
                // Middle digit - no rounding
                svg += `  <!-- Digit ${digit} -->
  <rect x="0" y="${currentY}" width="${width}" height="${digitHeight}" fill="${DIGIT_BG}"/>
  
 `;
            }
            
            // Digit text (adjusted center for narrower width)
            svg += `  <text x="20" y="${currentY + 21}" font-family="'Segoe UI', Ubuntu, Arial, sans-serif" font-size="18" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle">${digit}</text>
  
 `;

            currentY += digitHeight;
        }
        
        // End SVG
        svg += `</svg>`;
        
        return svg;
    }

    // Export public API
    return {
        HEADER_BG,
        DIGIT_BG,
        TEXT_COLOR,
        EYE_ICON,
        generateBadgeSVG
    };
}));