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
	// TODO: Refactoring! Add SpaceEvents here!
	if (!Meteor.userId() || Game.Queue.isBusy(item.group)) {
		return false;
	}

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

	var result = Game.Queue.Collection.upsert(select, {
		$setOnInsert: set
	});

	return result.insertedId ? true : false;
}

Game.Queue.complete = function(taskId) {
	if (!Meteor.userId()) {
		return;
	}

	Game.Queue.Collection.update({
		_id: taskId,
		user_id: Meteor.userId()
	}, {
		$set: {
			status: Game.Queue.status.DONE
		}
	});
}

var completeItems = function(items) {
	for (var i = 0; i < items.length; i++) {
		// Рассчитать доход до finishTime
		Game.Resources.updateWithIncome( items[i].finishTime );
		// Применить результат и завершить задание
		Game.getObjectByType( items[i].type ).add( items[i] );
		Game.Queue.complete( items[i]._id );
	}
}

Game.Queue.checkAll = function() {
	if (!Meteor.userId()) {
		return;
	}

	// Выбираем необработанные задачи, которые должны завершиться
	var items = Game.Queue.Collection.find({
		user_id: Meteor.userId(),
		status: { $ne: Game.Queue.status.DONE },
		finishTime: { $lt: Game.getCurrentTime() }
	}, {
		sort: {
			finishTime: -1
		}
	}).fetch();

	// Нет необработанных задач
	if (items.length == 0) {
		// Рассчитать доход до текущего времени
		Game.Resources.updateWithIncome(Game.getCurrentTime());
		return;
	}

	var ids = [];

	for (var i = 0; i < items.length; i++) {
		// Если уже обрабатывается
		if (items[i].status == Game.Queue.status.INPROGRESS) {
			// Если обрабатывается меньше чем PROCESS_TIMEOUT
			// Или обрабатывающий процесс ещё жив
			if (Game.getCurrentTime() - items[i].processedTime < Game.PROCESS_TIMEOUT
			 || Game.checkIsProcessActive(items[i].processId)
			) {
				return;
			}
		} else {
			ids.push(items[i]._id);
		}
	}

	// Забираем текущим процессом в обработку
	var updatedCount = Game.Queue.Collection.update({
		_id: { $in: ids },
		status: Game.Queue.status.INCOMPLETE
	}, {
		$set: {
			status: Game.Queue.status.INPROGRESS,
			processedTime: Game.getCurrentTime(),
			processId: Game.processId
		}
	}, {
		multi: true
	});

	// Если взяли задач столько же, сколько выбирали
	if (updatedCount == ids.length) {
		completeItems(items);
	} else {
		// Если другой процесс подхватил наши задачи
		var cursor = Game.Queue.Collection.find({
			_id: { $in: ids },
			status: Game.Queue.status.INCOMPLETE
		}, {
			sort: {
				finishTime: -1
			}
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

		// На всякий случай проверяем не обработались ли задачи
		if (cursor.count() <= updatedCount) {
			completeItems(cursor.fetch());
			observer.stop();
			observer = null;
		}
	}
}

Meteor.publish('queue', function () {
	if (this.userId) {
		return Game.Queue.Collection.find({
			user_id: this.userId,
			status: Game.Queue.status.INCOMPLETE
		});
	}
});

});