'use strict';

const fs = require('fs');
const path = require('path');
const GoonSite = require('./GoonSite');

/**
 * Compile the GoonSPA HTML document (no webpack / Hub UI bundle).
 */
class HTMLCompiler {
  /**
   * @param {Object} [settings]
   */
  constructor (settings = {}) {
    this.settings = settings;
    const siteConfig = settings.site || settings;
    this.site = new GoonSite(siteConfig);
  }

  /**
   * @param {string} [target]
   * @returns {Promise<boolean>}
   */
  async compileTo (target = 'assets/index.html') {
    const html = this.site.spa._renderWith('');
    const dir = path.dirname(target);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, html);
    return true;
  }
}

module.exports = HTMLCompiler;
