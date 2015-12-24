Meteor.startup(function() {
/*
{
	_id: ,
	user_id: ,
	incomplete: true,
	group: ,
	engName: ,
	startTime: ,
	finishTime: ,
	level: ,
	count: 
}
*/

Game.Queue.add = function(item) {
	//console.log('Очередь: +', item);
	if (Meteor.userId() && !Game.Queue.isBusy(item.group)) {
		var currentTime = Game.getCurrentTime();

		var set = {
			user_id: Meteor.userId(),
			incomplete: true,
			group: item.group,
			type: item.type,
			engName: item.engName,
			startTime: currentTime,
			finishTime: currentTime + item.time
		}

		if (item.level) {
			set.level = item.level;
		} else if (item.count) {
			set.count = item.count;
		}

		//console.log(set);

		Game.Queue.Collection.insert(set);
	}
}

Game.Queue.complete = function(taskId) {
	if (Meteor.userId()) {
		Game.Queue.Collection.update({
			_id: taskId,
			user_id: Meteor.userId()
		}, {
			$set: {
				incomplete: false
			}
		})
	}
}

Game.Queue.checkAll = function() {
	if (Meteor.userId()) {
		var items = Game.Queue.getAll();

		var currentTime = Game.getCurrentTime();

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.finishTime < currentTime) {
				//console.log(item.type);
				Game.getObjectByType(item.type).add(item);

				Game.Queue.complete(item._id);
			}
		}
	}
}

Meteor.publish('queue', function () {
	if (this.userId) {
		return Game.Queue.Collection.find({user_id: this.userId, incomplete: true});
	}
});

});