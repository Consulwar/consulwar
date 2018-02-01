import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initPaymentTekoServer = function() {
'use strict';

const PAYMENT_SYSTEM = 'teko';
const RUB = 643;

const errorCodes = {
  400: 'Неверный формат сообщения',
  401: 'Некорректная подпись запроса',
  406: 'Неверные данные запроса',
  1000: 'Неизвестная ошибка',
  1001: 'Учётная запись пользователя не найдена или заблокирована',
  1002: 'Неверная валюта платежа',
  1003: 'Неверная сумма платежа',
  1005: 'Запрашиваемые товары или услуги недоступны',
  2000: 'Платёж с указанным идентификатором уже зарезервирован',
  2001: 'Платёж с указанным идентификатором уже проведён',
  2002: 'Платёж с указанным идентификатором уже отменён'
};

Game.Payment.Teko = {};

initConfigTekoServer();

class PaymentError extends Meteor.Error {
  constructor(code) {
    super(errorCodes[code]);
    this.code = code;
  }
}

Router.route('/api/payment/teko/check', processRequest( function(user, data) {
  // try to insert transaction
  let checkResult = Game.Payment.Transactions.Collection.upsert({
    user_id: user._id,
    transaction_id: data.tx.id,
    payment_system: PAYMENT_SYSTEM
  }, {
    $setOnInsert: {
      user_id: user._id,
      username: user.username,
      transaction_id: data.tx.id,
      payment_system: PAYMENT_SYSTEM,
      status: 'check',
      time_created: Game.getCurrentTime()
    }
  });

  if (checkResult.insertedId) {
    // transaction inserted
    console.log('Transaction created');
    console.log('teko transaction id:', data.tx.id);
    console.log('merchant transaction id:', checkResult.insertedId);
    console.log('-------------------------------------');
    return checkResult.insertedId;
  } else {
    throw new PaymentError(getTransactionErrorCode(user, data));
  }

}), {where: 'server'});

Router.route('/api/payment/teko/success', processRequest( function(user, data, paymentItem) {
  let payResult = Game.Payment.Transactions.Collection.update({
    _id: data.partner_tx.id,
    user_id: user._id,
    transaction_id: data.tx.id,
    payment_system: PAYMENT_SYSTEM,
    status: 'check'
  }, {
    $set: {
      status: 'pay',
      time_updated: Game.getCurrentTime(),
      amount: paymentItem.cost.rub
    }
  });

  if (payResult === 1) {
    // add profit
    if (data.order.extra.profit.resources !== undefined) {
      Game.Resources.addProfit(data.order.extra.profit, data.dst.id);
    } else {
      // Обработка музыки
      if (data.order.extra.profit.music) {
        Meteor.users.update({
          _id: data.dst.id
        }, {
          $set: {
            music: true
          }
        });
      }
    }

    Game.Payment.Income.log(data.order.extra.profit, {
      type: 'payment',
      item: paymentItem.id,
      transaction_id: data.tx.id,
      payment_system: PAYMENT_SYSTEM
    }, data.dst.id);

    Log.increment({ name: 'payment_teko', count: paymentItem.cost.rub });

    // send response
    console.log('Transaction finished');
    console.log('teko transaction id:', data.tx.id);
    console.log('merchant transaction id:', data.partner_tx.id);
    console.log('-------------------------------------');

    if (paymentItem.cost.rub < 1000) {
      Game.Broadcast.add(user.username, `Хороший Консул. Спасибо.`);
    } else {
      Game.Broadcast.add(user.username, `Очень хороший Консул. Так держать.`);
    }

    return data.partner_tx.id;
  } else {
    throw new PaymentError(getTransactionErrorCode(user, data));
  }
}), {where: 'server'});

Router.route('/api/payment/teko/cancel', processRequest( function(user, data) {
  let cancelResult = Game.Payment.Transactions.Collection.update({
    _id: data.partner_tx.id,
    user_id: user._id,
    transaction_id: data.tx.id,
    payment_system: PAYMENT_SYSTEM,
    status: 'check'
  }, {
    $set: {
      status: 'cancel',
      time_updated: Game.getCurrentTime(),
      reason: {
        code: data.code,
        description: data.description
      }
    }
  });

  if (cancelResult === 1) {
    // transaction canceled
    console.log('Transaction canceled');
    console.log('teko transaction id:', data.tx.id);
    console.log('merchant transaction id:', data.partner_tx.id);
    console.log('-------------------------------------');

    return data.partner_tx.id;
  } else {
    throw new PaymentError(getTransactionErrorCode(user, data));
  }
}), {where: 'server'} );

// get onProcess function that returns transaction id
function processRequest(onProcess) {
  return function() {
    let data = this.request.body;

    try {
      checkRequest(this.request);

      let user = Meteor.users.findOne({
        _id: data.dst.id
      });

      checkUser(user);

      let paymentItem = Game.Payment.items[ data.order.item_list[0].id ];

      checkData(data, paymentItem);

      let id = onProcess(user, data, paymentItem);
      answerSuccess(this.response, id);

    } catch (err) {
      if (err instanceof PaymentError) {
        answerError(this.response, data, err.code);
      } else {
        throw err;
      }
    }
  };
}

let checkRequest = function(request) {
  let data = request.body;

  //check body
  if (!_.isObject(data)) {
    throw new PaymentError(400);
  }

  // check signature
  if (request.headers.signature !== signString(request.rawBody)) {
    throw new PaymentError(401);
  }

  if (!checkDataFormat(data)) {
    throw new PaymentError(406);
  }
};

let checkUser = function(user) {
  if (!user || !user._id || user.blocked === true) {
    throw new PaymentError(1001);
  }
};

let checkData = function(data, paymentItem) {
  if (data.payment.currency !== RUB) {
    throw new PaymentError(1002);
  }

  if (data.payment.exponent !== 2 || data.payment.amount !== paymentItem.cost.rub * 100) {
    throw new PaymentError(1003);
  }

  if ( !paymentItem
    || !paymentItem.profit
    || !_.isEqual(paymentItem.profit, data.order.extra.profit)
  ) {
    throw new PaymentError(1005);
  }
};

let answerError = function(response, data, code) {
  let description = errorCodes[code];
  let responseData = {
    success: false,
    result: {
      tx: {
        id: (data.partner_tx || data.tx).id,
        start_t: Date.now()
      },
      code: code,
      description: description
    }
  };
  response.end(JSON.stringify(responseData));
};

let answerSuccess = function(response, id) {
  let responseData = {
    success: true,
    result: {
      tx: {
        id: id,
        start_t: Date.now()
      }
    }
  };
  response.end(JSON.stringify(responseData));
};

let checkDataFormat = function(data) {
  let dataErrors = [];

  if (!data) {
    dataErrors.push('data is null');
  } else {
    // check payment info
    if ( !data.payment
      || !data.payment.amount
      || !data.payment.currency
      || !data.payment.exponent
    ) {
      dataErrors.push('data.payment.amount required');
      dataErrors.push('data.payment.currency required');
      dataErrors.push('data.payment.exponent required');
    }
    // check dst info
    if (!data.dst || !data.dst.id) {
      dataErrors.push('data.dst.id required');
    }
    // check order items info
    if (!data.order || !data.order.item_list) {
      dataErrors.push('data.order.item_list required');
    } else {
      if (!_.isArray(data.order.item_list)
        ||  data.order.item_list.length === 0
        || !data.order.item_list[0].id
        || !data.order.item_list[0].name
      ) {
        dataErrors.push('data.order.item_list is incorrect');
      }

      if (!_.isObject(data.order.extra.profit)) {
        dataErrors.push('data.order.extra is incorrect');
      }
    }
  }

  if (dataErrors.length > 0) {
    console.log('Error: incorrect request data!');
    console.log('data:', data);
    console.log(dataErrors.join('\n'));
    console.log('-------------------------------------');

    return false;
  }

  return true;
};

let getTransactionErrorCode = function(user, data) {
  let errorCode = 1000;

  let transaction = Game.Payment.Transactions.Collection.findOne({
    user_id: user._id,
    transaction_id: data.tx.id,
    payment_system: PAYMENT_SYSTEM
  });

  if (transaction) {
    switch (transaction.status) {
      case 'check':
        errorCode = 2000;
        break;
      case 'pay':
        errorCode = 2001;
        break;
      case 'cancel':
        errorCode = 2002;
        break;
    }
  }

  return errorCode;
};

Meteor.methods({
  'teko.getPaymentUrl': function(id) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'teko.getPaymentUrl', user });

    // check payment item
    check(id, String);
    let paymentItem = Game.Payment.items[id];

    if (!paymentItem || !paymentItem.profit) {
      throw new Meteor.Error('Ты втираешь мне какую-то дичь');
    }

    // create url
    let pay = {
      initiator: {
        id: Game.Payment.Teko.INITIATOR_ID,
        showcase: Game.Payment.Teko.SHOWCASE
      },
      payment: {
        amount: paymentItem.cost.rub * 100,
        currency: RUB,
        exponent: 2
      },
      order: {
        cls: 'item_list',
        item_list: [{
          id: id,
          name: paymentItem.name
        }],
        extra: {
          profit: paymentItem.profit
        }
      },
      dst: {
        id: user._id
      },
      locale: Game.Payment.Teko.LOCALE,
      product: Game.Payment.Teko.PRODUCT,
      theme: Game.Payment.Teko.THEME,
      url: Game.Payment.Teko.GAME_URL
    };

    pay.signature = signObject(pay);

    let url = '';
    for (let key in pay) {
      if (pay.hasOwnProperty(key)) {
        url += key + '=';
        if (typeof pay[key] === 'string') {
          url += encodeURIComponent( pay[key] );
        } else {
          url += encodeURIComponent( JSON.stringify(pay[key]) );
        }
        url += '&';
      }
    }

    return Game.Payment.Teko.BASE_URL + '?' + url.substr(0, url.length - 1);
  }
});

let signObject = function(data) {
  let sortedData = objectRecursiveSort(data);
  let forSign = [];

  for (let key in sortedData) {
    if (sortedData.hasOwnProperty(key) && signedKey(key)) {
      let value = sortedData[key];
      if (typeof value === 'string') {
        forSign.push(key, value);
      } else {
        forSign.push(key, JSON.stringify(value));
      }
    }
  }

  return signString(forSign.join('|'));
};

let signedKey = function(key) {
  return [
    'initiator',
    'dst',
    'payment',
    'order',
    'product',
    'redirect_url',
    'locale',
    'comment',
    'inner_cur_amount',
    'inner_cur_name'
  ].indexOf(key) >= 0;
};

let objectRecursiveSort = function(obj) {
  return _.object( _.sortBy( _.map(obj, function(value, key) {
    return [
      key,
      value
    ];
  }), function(arr) {
    return arr[0];
  }));
};

let signString = function(str) {
  return (
    CryptoJS.HmacSHA1(
      str,
      Game.Payment.Teko.SECRET_KEY
    ).toString(CryptoJS.enc.Base64)
  );
};

};