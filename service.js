define([
	"troopjs-core/component/gadget",
	"troopjs-core/pubsub/hub"
], function (Gadget, hub) {

	var UNDEFINED;
	var DICTIONARY = "dictionary";

	return Gadget.extend(function () {
		this[DICTIONARY] = {};
	}, {
		"sig/start": function () {
			return hub.publish("l10n/start");
		},

		"sig/stop": function () {
			return hub.publish("l10n/stop");
		},

		"hub/l10n/get": function (key, value) {
			var me = this;
			var dictionary = me[DICTIONARY];

			return me.task(function (resolve, reject) {
				if (dictionary.hasOwnProperty(key)) {
					resolve([ key, dictionary[key] ]);
				}
				else {
					hub
						.publish("l10n/fetch", key, UNDEFINED)
						.spread(function (_key, _value) {
							return _value === UNDEFINED
								? [ key, value ]
								: hub.publish("l10n/put", _key, _value);
						})
						.then(resolve, reject);
				}
			});
		},

		"hub/l10n/put": function (key, value) {
			return hub
				.publish("l10n/update", key, this[DICTIONARY][key] = value)
				.yield([ key, value ]);
		}
	});
});