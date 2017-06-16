initConfigTekoServer = function() {
'use strict';

if (!Meteor.settings.payment
	|| !Meteor.settings.payment.teko
	|| !Meteor.settings.payment.teko.initiatorId
	|| !Meteor.settings.payment.teko.secretKey
	|| !Meteor.settings.payment.teko.product
	|| !Meteor.settings.payment.teko.showcase
	|| !Meteor.settings.payment.teko.locale
	|| !Meteor.settings.payment.teko.url
	|| !Meteor.settings.payment.teko.signedKeys
	|| !Meteor.settings.payment.teko.gameUrl
	|| !Meteor.settings.payment.teko.theme
) {
	throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры платёжки (см. settings.sample payment.teko)');
}

Game.Payment.Teko.INITIATOR_ID = Meteor.settings.payment.teko.initiatorId;
Game.Payment.Teko.SECRET_KEY = Meteor.settings.payment.teko.secretKey;
Game.Payment.Teko.PRODUCT = Meteor.settings.payment.teko.product;
Game.Payment.Teko.SHOWCASE = Meteor.settings.payment.teko.showcase;
Game.Payment.Teko.LOCALE = Meteor.settings.payment.teko.locale;
Game.Payment.Teko.BASE_URL = Meteor.settings.payment.teko.url;
Game.Payment.Teko.SIGNED_KEYS = Meteor.settings.payment.teko.signedKeys;
Game.Payment.Teko.GAME_URL = Meteor.settings.payment.teko.gameUrl;
Game.Payment.Teko.THEME = Meteor.settings.payment.teko.theme;
};
