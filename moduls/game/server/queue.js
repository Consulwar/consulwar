import content from '/imports/content/server';

Meteor.startup(function() {
'use strict';

/*
{
  // Required fields:
  user_id
  status
  type
  startTime
  finishTime

  // Additional for space event:
  eventId

  // Additional for unit:
  group
  engName
  count
  
  // Additional for building, research:
  group
  engName
  level

  // Additional options:
  dontNeedResourcesUpdate
}
*/

Game.Queue.Collection._ensureIndex({
  user_id: 1,
  status: 1,
  finishTime: -1
});

Game.Queue.add = function(item, userId = Meteor.userId()) {
  if (!userId) {
    return null;
  }

  if (item.group && Game.Queue.isBusy(item.group, userId)) {
    return null;
  }

  var startTime = item.startTime
    ? item.startTime
    : Game.getCurrentTime();

  var set = {
    user_id: userId,
    type: item.type,
    startTime: startTime,
    finishTime: startTime + item.time,
    createdTime: Game.getCurrentTime(), // debug field
    data: item.data,
  };

  var select = {
    user_id: userId,
    type: item.type,
    finishTime: { $gt: startTime },
    status: Game.Queue.status.INCOMPLETE,
  };

  // parse additonal options
  if (item.eventId) {
    set.eventId = item.eventId;
    select.eventId = item.eventId;
  }

  if (item.group) {
    set.group = item.group;
    select.group = item.group;
  }

  if (item.engName) {
    set.engName = item.engName;
    select.engName = item.engName;
  }

  if (item.itemId) {
    set.itemId = item.itemId;
  }

  if (item.level) {
    set.level = item.level;
    select.level = item.level;
  } else if (item.count) {
    set.count = item.count;
    select.count = item.count;
  }

  if (item.dontNeedResourcesUpdate) {
    set.dontNeedResourcesUpdate = true;
  }

  if (set.startTime > set.finishTime) {
    set.status = Game.Queue.status.DONE;
  } else {
    // check if task need to be processed right now
    if (set.finishTime < set.createdTime) {
      // mark as processing in progress
      set.status = Game.Queue.status.INPROGRESS;
      set.processedTime = Game.getCurrentTime();
      set.processId = Game.processId;
    } else {
      set.status = Game.Queue.status.INCOMPLETE;
    }
  }

  // try to insert new task
  var result = Game.Queue.Collection.upsert(select, {
    $setOnInsert: set
  });

  if (result.insertedId) {
    set._id = result.insertedId;
  }

  return result.insertedId ? set : null;
};

Game.Queue.cancel = function(taskId) {
  if (!Meteor.userId()) {
    return;
  }

  return Game.Queue.Collection.update({
    _id: taskId,
    user_id: Meteor.userId(),
    status: Game.Queue.status.INCOMPLETE,
  }, {
    $set: {
      status: Game.Queue.status.DONE,
      cancelled: true,
    }
  });
};

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
};

Game.Queue.spendTime = function(taskId, time) {
  Game.Queue.Collection.update({
    _id: taskId
  }, {
    $inc: {
      finishTime: -time
    }
  });
};

var completeItems = function(items, needResourcesUpdate, ratingMultiplier) {
  while (items.length > 0) {
    var item = items.shift();
    // Рассчитать доход до finishTime
    if (needResourcesUpdate && !item.dontNeedResourcesUpdate) {
      Game.Resources.updateWithIncome( item.finishTime );
    }
    if (item.itemId) {
      content[item.itemId].complete(item);
    } else {
      // Применить результат
      var newTask = Game.getObjectByType( item.type ).complete( item );
      // Если в результате получено новое задание, вставить его в массив
      if (newTask
      && newTask.finishTime
      && newTask.finishTime < Game.getCurrentTime()
      ) {
        var isInserted = false;
        for (var i = 0; i < items.length; i++) {
          if (newTask.finishTime <= items[i].finishTime) {
            items.splice(i, 0, newTask);
            isInserted = true;
            break;
          }
        }
        if (!isInserted) {
          items.push(newTask);
        }
      }
    }
    if (item.data && item.data.rating) {
      Meteor.users.update({
        _id: item.user_id,
      }, {
        $inc: {
          rating: item.data.rating * (ratingMultiplier || 1),
        },
      });
    }
    // Отметить текущее задание как обработанное
    Game.Queue.complete( item._id );
  }
};

Game.Queue.checkAll = function() {
  const user = Meteor.user();
  if (!user) {
    return false;
  }

  // Выбираем необработанные задачи, которые должны завершиться
  var items = Game.Queue.Collection.find({
    user_id: user._id,
    status: { $ne: Game.Queue.status.DONE },
    finishTime: { $lt: Game.getCurrentTime() }
  }, {
    sort: {
      finishTime: 1
    }
  }).fetch();

  // Нет необработанных задач
  if (items.length === 0) {
    // Рассчитать доход до текущего времени
    Game.Resources.updateWithIncome(Game.getCurrentTime());
    return false;
  }

  var ids = [];
  var needUpdateResources = true;

  for (var i = 0; i < items.length; i++) {
    // Если уже обрабатывается
    if (items[i].status == Game.Queue.status.INPROGRESS) {
      // Если обрабатывается меньше чем PROCESS_TIMEOUT
      // Или обрабатывающий процесс ещё жив
      if (Game.getCurrentTime() - items[i].processedTime < Game.PROCESS_TIMEOUT
       || Game.checkIsProcessActive(items[i].processId)
      ) {
        return false;
      }
      // Если подхватили чужое задание, то не обновляем ресурсы
      needUpdateResources = false;
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
    completeItems(items, needUpdateResources, user.ratingMultiplier);
  } else {
    // Если другой процесс подхватил наши задачи
    var cursor = Game.Queue.Collection.find({
      _id: { $in: ids },
      status: Game.Queue.status.INPROGRESS
    }, {
      sort: {
        finishTime: 1
      }
    });

    // Подписываемся на изменение задач, которые забрал другой процесс
    var observer = cursor.observeChanges({
      removed: function(id, fields) {
        // Ожидаем пока другой процесс обработает свои задачи
        if (cursor.count() <= updatedCount && observer) {
          completeItems(cursor.fetch(), needUpdateResources, user.ratingMultiplier);
          observer.stop();
          observer = null;
        }
      }
    });

    // На всякий случай проверяем не обработались ли задачи
    if (cursor.count() <= updatedCount && observer) {
      completeItems(cursor.fetch(), needUpdateResources, user.ratingMultiplier);
      observer.stop();
      observer = null;
    }
  }

  return true;
};

Meteor.publish('queue', function () {
  if (this.userId) {
    return Game.Queue.Collection.find({
      user_id: this.userId,
      status: Game.Queue.status.INCOMPLETE
    });
  }
});

});