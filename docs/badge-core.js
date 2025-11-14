/**
 * Custom Badge Generator - Core Module
 * Shared code for both Node.js (generate-badge.js) and browser (docs/badge-generator.js)
 * Works in both environments using Universal Module Definition pattern
 *
 * Supports multiple badge styles:
 * - 'classic' - Simple, clean design with solid colors
 * - 'animated' - Advanced animations with gradients and effects (based on Rust implementation)
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

    // Dimensions
    const WIDTH = 40;
    const HEADER_HEIGHT = 40;
    const DIGIT_HEIGHT = 32;

    // Classic style colors
    const CLASSIC_HEADER_BG = '#1f2937';  // gray-800
    const CLASSIC_DIGIT_BG = '#3b82f6';   // blue-500
    const CLASSIC_TEXT_COLOR = '#ffffff'; // white

    /**
     * Generates classic style SVG badge (simple, clean design)
     * @param {number} views - Number of views to display
     * @returns {string} - SVG content as string
     */
    function generateBadgeSVG_classic(views) {
        const viewsString = String(views);
        const numDigits = viewsString.length;
        const totalHeight = HEADER_HEIGHT + (numDigits * DIGIT_HEIGHT);
        const cornerRadius = 4;
        
        // Start SVG
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Profile Views">
  <title>GitHub Profile Views: ${views}</title>
  
  <!-- Header with Eye icon (rounded top) -->
  <rect x="0" y="0" width="${WIDTH}" height="${HEADER_HEIGHT}" fill="${CLASSIC_HEADER_BG}" rx="${cornerRadius}" ry="${cornerRadius}"/>
  <rect x="0" y="${cornerRadius}" width="${WIDTH}" height="${HEADER_HEIGHT - cornerRadius}" fill="${CLASSIC_HEADER_BG}"/>
  
  <!-- Eye icon -->
  <g transform="translate(4, 4)">
    <svg width="32" height="32" viewBox="0 0 24 24">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  </g>
  
 `;

        // Generate digits
        let currentY = HEADER_HEIGHT;
        for (let i = 0; i < numDigits; i++) {
            const digit = viewsString[i];
            const isLast = i === numDigits - 1;
            
            // Digit background
            if (isLast) {
                // Last digit - rounded corners at bottom
                svg += `  <!-- Digit ${digit} (last) -->
  <rect x="0" y="${currentY}" width="${WIDTH}" height="${DIGIT_HEIGHT}" fill="${CLASSIC_DIGIT_BG}" rx="${cornerRadius}" ry="${cornerRadius}"/>
  <!-- Cover top rounded corners -->
  <rect x="0" y="${currentY}" width="${WIDTH}" height="${DIGIT_HEIGHT - cornerRadius}" fill="${CLASSIC_DIGIT_BG}"/>
  
 `;
            } else {
                // Middle digit - no rounding
                svg += `  <!-- Digit ${digit} -->
  <rect x="0" y="${currentY}" width="${WIDTH}" height="${DIGIT_HEIGHT}" fill="${CLASSIC_DIGIT_BG}"/>
  
 `;
            }
            
            // Digit text
            svg += `  <text x="20" y="${currentY + 21}" font-family="'Segoe UI', Ubuntu, Arial, sans-serif" font-size="18" font-weight="bold" fill="${CLASSIC_TEXT_COLOR}" text-anchor="middle">${digit}</text>
  
 `;

            currentY += DIGIT_HEIGHT;
        }
        
        // End SVG
        svg += `</svg>`;
        
        return svg;
    }

    /**
     * Generates animated style SVG badge (advanced animations and effects)
     * @param {number} views - Number of views to display
     * @returns {string} - SVG content as string
     */
    function generateBadgeSVG_animated(views) {
        const viewsString = String(views);
        const numDigits = viewsString.length;
        const totalHeight = HEADER_HEIGHT + (numDigits * DIGIT_HEIGHT);
        
        // Start building SVG
        let svg = `<svg width="${WIDTH}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Profile Views">
    <style>
        .gradient-shift {
            animation: gradientShift 4s ease-in-out infinite;
        }
        @keyframes gradientShift {
            0% { stop-color: #ff0055; }
            25% { stop-color: #ff0080; }
            50% { stop-color: #d400ff; }
            75% { stop-color: #9b00ff; }
            100% { stop-color: #ff0055; }
        }
        .bg-shape {
            opacity: 0.3;
            animation: morph 8s ease-in-out infinite;
        }
        .bg-shape:nth-child(1) { animation-delay: 0s; }
        .bg-shape:nth-child(2) { animation-delay: 1s; }
        .bg-shape:nth-child(3) { animation-delay: 2s; }
        @keyframes morph {
            0%, 100% {
                transform: rotate(0deg) scale(1);
                opacity: 0.3;
            }
            25% {
                transform: rotate(90deg) scale(1.2);
                opacity: 0.5;
            }
            50% {
                transform: rotate(180deg) scale(0.8);
                opacity: 0.2;
            }
            75% {
                transform: rotate(270deg) scale(1.1);
                opacity: 0.4;
            }
        }
        .particle {
            animation: float-particle 10s linear infinite;
        }
        @keyframes float-particle {
            0% {
                transform: translateY(${totalHeight}px) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-10px) translateX(10px);
                opacity: 0;
            }
        }
        .wave {
            animation: wave-motion 6s ease-in-out infinite;
        }
        @keyframes wave-motion {
            0%, 100% {
                d: path("M20,0 Q10,50 20,100 T20,${totalHeight}");
            }
            50% {
                d: path("M20,0 Q30,50 20,100 T20,${totalHeight}");
            }
        }
        .digit-glow {
            fill: url(#gradient);
            filter: url(#glow);
            animation: float 6s ease-in-out infinite;
        }
        .digit-glow:nth-child(1) { animation-delay: 0.1s; }
        .digit-glow:nth-child(2) { animation-delay: 0.2s; }
        .digit-glow:nth-child(3) { animation-delay: 0.3s; }
        .digit-glow:nth-child(4) { animation-delay: 0.4s; }
        .digit-glow:nth-child(5) { animation-delay: 0.5s; }
        .digit-glow:nth-child(6) { animation-delay: 0.6s; }
        .digit-glow:nth-child(7) { animation-delay: 0.7s; }
        .digit-glow:nth-child(8) { animation-delay: 0.8s; }
        .digit-glow:nth-child(9) { animation-delay: 0.9s; }
        .digit-glow:nth-child(10) { animation-delay: 1.0s; }
        .eye-icon {
            stroke: url(#gradient);
            animation: float 6s ease-in-out infinite, blink 4s ease-in-out infinite;
            transform-origin: center;
        }
        @keyframes blink {
            0%, 45%, 55%, 100% {
                transform: scaleY(1);
            }
            50% {
                transform: scaleY(0.1);
            }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            33% { transform: translateY(-3px) scale(1.02); }
            66% { transform: translateY(2px) scale(0.98); }
        }
        .bg-digit {
            fill: url(#bgGradient);
            opacity: 0.2;
            animation: pulse 4s ease-in-out infinite;
            font-family: 'Segoe UI', Ubuntu, Arial, sans-serif;
            font-weight: bold;
        }
        .bg-digit:nth-child(1) { animation-delay: 0s; }
        .bg-digit:nth-child(2) { animation-delay: 0.5s; }
        .bg-digit:nth-child(3) { animation-delay: 1s; }
        .bg-digit:nth-child(4) { animation-delay: 1.5s; }
        .bg-digit:nth-child(5) { animation-delay: 2s; }
        .bg-digit:nth-child(6) { animation-delay: 2.5s; }
        .bg-digit:nth-child(7) { animation-delay: 3s; }
        .bg-digit:nth-child(8) { animation-delay: 3.5s; }
        .bg-digit:nth-child(9) { animation-delay: 4s; }
        .bg-digit:nth-child(10) { animation-delay: 4.5s; }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.4); opacity: 0.05; }
        }
    </style>
    <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" class="gradient-shift" stop-color="#ff0055"/>
            <stop offset="50%" class="gradient-shift" stop-color="#ff0080"/>
            <stop offset="100%" class="gradient-shift" stop-color="#d400ff"/>
        </linearGradient>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0080" stop-opacity="0.5"/>
            <stop offset="50%" stop-color="#d400ff" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0080" opacity="0.5"/>
            <stop offset="100%" stop-color="#d400ff" opacity="0.2"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur">
                <animate attributeName="stdDeviation" values="3;6;3" dur="4s" repeatCount="indefinite"/>
            </feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="0.2 0 0 0 0  0 0.1 0 0 0  0 0 0.3 0 0  0 0 0 18 -3" result="glow"/>
            <feBlend in="SourceGraphic" in2="glow" mode="screen"/>
        </filter>
    </defs>
    
    <!-- Animated background elements for header -->
    <g>
        <circle class="bg-shape" cx="10" cy="20" r="6" fill="url(#shapeGradient)"/>
        <circle class="bg-shape" cx="30" cy="20" r="5" fill="url(#shapeGradient)"/>
        <rect class="bg-shape" x="15" y="8" width="8" height="8" rx="2" fill="url(#shapeGradient)" transform="rotate(45 19 12)"/>
    </g>
    
    <!-- Eye icon -->
    <g transform="translate(4, 4)">
        <svg width="32" height="32" viewBox="0 0 24 24">
            <path class="eye-icon" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow)"/>
            <circle class="eye-icon" cx="12" cy="12" r="3" stroke-width="2" fill="none" filter="url(#glow)"/>
        </svg>
    </g>
    
`;

        // Background digit shapes
        svg += '    <!-- Background digit shapes that pulse behind the main digits -->\n    <g class="digit-backgrounds">\n';
        let bgY = HEADER_HEIGHT + 21;
        for (let i = 0; i < viewsString.length; i++) {
            const digit = viewsString[i];
            svg += `        <text x="20" y="${bgY}" font-size="24" text-anchor="middle" class="bg-digit">${digit}</text>\n`;
            bgY += DIGIT_HEIGHT;
        }
        svg += '    </g>\n    \n';

        // Floating particles - dynamically generated based on height
        svg += '    <!-- Floating particles -->\n    <g>\n';
        let particleY = 56;
        let particleDelay = 0;
        while (particleY < totalHeight - 16) {
            const particleX = particleDelay % 2 === 0 ? 15 : 25;
            svg += `        <circle class="particle" cx="${particleX}" cy="${particleY}" r="1.5" fill="#ffffff" opacity="0.6" style="animation-delay: ${particleDelay}s"/>\n`;
            particleY += 32;
            particleDelay += 2;
        }
        svg += '    </g>\n    \n';

        // Main digit display
        svg += '    <!-- Main digit display -->\n    <g class="digit-section">\n';
        let currentY = HEADER_HEIGHT + 21;
        for (let i = 0; i < viewsString.length; i++) {
            const digit = viewsString[i];
            svg += `        <text x="20" y="${currentY}" font-family="'Segoe UI', Ubuntu, Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" class="digit-glow">${digit}</text>\n`;
            currentY += DIGIT_HEIGHT;
        }
        svg += '    </g>\n    \n';

        // Animated wave overlay
        svg += `    <!-- Animated wave overlay -->\n    <path class="wave" d="M20,0 Q10,50 20,100 T20,${totalHeight}" stroke="url(#shapeGradient)" stroke-width="1.5" fill="none" opacity="0.4"/>\n`;

        // End SVG
        svg += '</svg>';

        return svg;
    }

    /**
     * Main function to generate SVG badge with configurable style
     * @param {number} views - Number of views to display
     * @param {string} style - Badge style: 'classic' or 'animated' (default: 'animated')
     * @returns {string} - SVG content as string
     */
    function generateBadgeSVG(views, style = 'animated') {
        // Support environment variable for default style (Node.js only)
        if (typeof process !== 'undefined' && process.env && process.env.BADGE_STYLE) {
            style = process.env.BADGE_STYLE;
        }
        
        // Normalize style string
        style = String(style).toLowerCase().trim();
        
        switch (style) {
            case 'classic':
            case 'simple':
            case 'basic':
                return generateBadgeSVG_classic(views);
            
            case 'animated':
            case 'advanced':
            case 'fancy':
            default:
                return generateBadgeSVG_animated(views);
        }
    }

    // Export public API
    return {
        WIDTH,
        HEADER_HEIGHT,
        DIGIT_HEIGHT,
        CLASSIC_HEADER_BG,
        CLASSIC_DIGIT_BG,
        CLASSIC_TEXT_COLOR,
        generateBadgeSVG,
        generateBadgeSVG_classic,
        generateBadgeSVG_animated,
        // Helper to list available styles
        availableStyles: ['classic', 'animated']
    };
}));