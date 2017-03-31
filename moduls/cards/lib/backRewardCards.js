initBackRewardCardsLib = function() {
'use strict';

game.BackRewardCard = function(options) {
	// Параметры по умолчанию, чтобы не дублировать в контенте
	options.cardType = 'backReward';
	options.cardGroup = 'backRewards';

	game.BackRewardCard.superclass.constructor.apply(this, arguments);

	this.fromDay = options.fromDay;
};
game.extend(game.BackRewardCard, game.Card);

Game.BackRewardCard = {
	SECONDS_BETWEEN_CHECK: 3600
};

};