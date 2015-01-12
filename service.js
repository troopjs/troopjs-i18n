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
			return hub.publish("i18n/start");
		},

		"sig/stop": function () {
			return hub.publish("i18n/stop");
		},

		"hub/i18n/get": function (key, value) {
			var me = this;
			var dictionary = me[DICTIONARY];

			return me.task(function (resolve, reject) {
				if (dictionary.hasOwnProperty(key)) {
					resolve([ key, dictionary[key] ]);
				}
				else {
					hub
						.publish("i18n/fetch", key, UNDEFINED)
						.spread(function (_key, _value) {
							return _value === UNDEFINED
								? [ key, value ]
								: hub.publish("i18n/put", _key, _value);
						})
						.then(resolve, reject);
				}
			});
		},

		"hub/i18n/put": function (key, value) {
			return hub
				.publish("i18n/update", key, this[DICTIONARY][key] = value)
				.yield([ key, value ]);
		}
	});
});