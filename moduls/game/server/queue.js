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

		Meteor._sleepForMs(3000);

		var currentTime = Game.getCurrentTime();

		var set = {
			user_id: Meteor.userId(),
			status: 0,
			group: item.group,
			type: item.type,
			engName: item.engName,
			startTime: currentTime,
			finishTime: currentTime + item.time
		}

		var select = {
			user_id: Meteor.userId(),
			group: item.group,
			type: item.type,
			engName: item.engName,
			finishTime: { $gt: currentTime }
		}

		if (item.level) {
			set.level = item.level;
			select.level = item.level;
		} else if (item.count) {
			set.count = item.count;
			select.count = item.count;
		}

		//console.log(set);

		var result = Game.Queue.Collection.upsert(select, {
			$setOnInsert: set
		});

		return result.insertedId ? true : false;
	}

	return false;
}

Game.Queue.complete = function(taskId) {
	if (Meteor.userId()) {
		Game.Queue.Collection.update({
			_id: taskId,
			user_id: Meteor.userId()
		}, {
			$set: {
				status: 2
			}
		})
	}
}

var completeItems = function(items) {
	for (var i = 0; i < items.length; i++) {
		Game.Resources.updateWithIncome(items[i].finishTime)
		Game.getObjectByType(items[i].type).add(items[i]);
		Game.Queue.complete(items[i]._id);
	}
	
}

Game.Queue.checkAll = function() {
	if (Meteor.userId()) {
		// Выбираем необработанные задачи, которые должны завершиться
		var items = Game.Queue.Collection.find({
			user_id: Meteor.userId(),
			status: {$ne: 2},
			finishTime: {$lt: Game.getCurrentTime()}
		}).fetch();

		// Нет необработанных задач
		if (items.length == 0) {
			Game.Resources.updateWithIncome(Game.getCurrentTime());
			return;
		}

		var ids = [];

		for (var i = 0; i < items.length; i++) {
			// Если уже обрабатывается
			if (items[i].status == 1) {
				// Если обрабатывается меньше чем PROCESS_TIMEOUT
				if (Game.getCurrentTime() - items[i].processedTime < Game.PROCESS_TIMEOUT) {
					return;
				} else {
					var isActive = ApplicationCollection.findOne({
						processId: items[i].processId
					});
					// Если обрабатывающий процесс ещё жив
					if (isActive) {
						return;
					}
				}
			}
			ids.push(items[i]._id);
		}

		// Забираем текущим процессом в обработку
		var updatedCount = Game.Queue.Collection.update({
			_id: {$in: ids},
			status: 0
		}, {
			$set: {
				status: 1,
				processedTime: Game.getCurrentTime(),
				processId: Game.processId
			}
		});

		// Если взяли задач столько же, сколько выбирали
		if (updatedCount == ids.length) {
			completeItems(items);
		} else {
			var cursor = Game.Queue.Collection.find({
				_id: { $in: ids },
				status: 0
			});

			// Подписываемся на изменение задач, которые забрал другой процесс
			var observer = cursor.observeChanges({
				removed: function(id, fields) {
					// Ожидаем пока другой процесс обработает свои задачи
					if (cursor.count() <= updatedCount) {
						completeItems(cursor.fetch());
						observer.stop();
						observer = null;
					}
				}
			});

			if (cursor.count() <= updatedCount) {
				completeItems(cursor.fetch());
				observer.stop();
				observer = null;
			}
		}
	}
}

Meteor.publish('queue', function () {
	if (this.userId) {
		return Game.Queue.Collection.find({user_id: this.userId, status: 0});
	}
});

});