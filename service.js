/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "troopjs-hub/component",
  "troopjs-hub/emitter"
], function (Component, hub) {
  "use strict";

  var UNDEFINED;
  var DICTIONARY = "dictionary";


  /**
   * Provides localization as a service
   * @class l10n.service
   * @extend hub.component
   * @alias service.l10n
   */

  /**
   * Triggered when the localization service starts
   * @event hub/l10n/start
   */

  /**
   * Triggered when the localization service stops
   * @event hub/l10n/stop
   */

  /**
   * Triggered when a localization GET is performed
   * @event hub/l10n/get
   * @param {String} key Localization key
   * @param {String} [value] Default value
   */

  /**
   * Triggered when a localization FETCH is performed
   * @event hub/l10n/fetch
   * @inheritdoc #event-hub/l10n/get
   */

  /**
   * Triggered when a localization PUT is performed
   * @event hub/l10n/put
   * @param {String} key Localization key
   * @param {String} value Localization value
   */

  /**
   * Triggered when a localization UPDATE is performed
   * @event hub/l10n/update
   * @inheritdoc #event-hub/l10n/put
   */

  /**
   * @method constructor
   */
  return Component.extend(function () {
    this[DICTIONARY] = {};
  }, {
    "displayName": "l10n/service",

    /**
     * @handler
     * @inheritdoc #event-sig/start
     * @localdoc Notifies interested parties about the service start
     * @fires hub/l10n/start
     */
    "sig/start": function () {
      return hub.emit("l10n/start");
    },

    /**
     * @handler
     * @inheritdoc #event-sig/stop
     * @localdoc Notifies interested parties about the service stop
     * @fires hub/l10n/stop
     */
    "sig/stop": function () {
      return hub.emit("l10n/stop");
    },

    /**
     * @handler
     * @inheritdoc #event-hub/l10n/get
     * @localdoc Gets localization
     * @fires hub/l10n/fetch
     * @fires hub/l10n/put
     * @return {Array}
     */
    "hub/l10n/get": function (key, value) {
      var me = this;
      var dictionary = me[DICTIONARY];

      return me.task(function (resolve, reject) {
        if (dictionary.hasOwnProperty(key)) {
          resolve([ key, dictionary[key] ]);
        }
        else {
          hub
            .emit("l10n/fetch", key, UNDEFINED)
            .spread(function (_key, _value) {
              return _value === UNDEFINED
                ? [ key, value ]
                : hub.emit("l10n/put", _key, _value);
            })
            .then(resolve, reject);
        }
      });
    },

    /**
     * @handler
     * @inheritdoc #event-hub/l10n/put
     * @localdoc Puts localization
     * @fires hub/l10n/update
     * @return {Array}
     */
    "hub/l10n/put": function (key, value) {
      return hub
        .emit("l10n/update", key, this[DICTIONARY][key] = value)
        .yield([ key, value ]);
    }
  });
});
