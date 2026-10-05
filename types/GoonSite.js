'use strict';

const FabricSite = require('@fabric/http/types/site');
const GoonSPA = require('./GoonSPA');

/**
 * Bundles the GoonSPA with the FabricSite.
 */
class GoonSite extends FabricSite {
  /**
   * Create an instance of the GoonSite.
   * @param {Object} [settings] Map of settings.
   * @param {HTTPComponent} [settings.document] Document to use.
   */
  constructor (settings = {}) {
    super(settings);
    this.spa = new GoonSPA(this.settings);
    return this;
  }
}

module.exports = GoonSite;
