import datadog from './datadog';

const pad = function(value) {
  return (value < 10) ? `0${value}` : value;
};

const pad1000 = function(value) {
  if (value < 10) {
    return `00${value}`;
  } else if (value < 100) {
    return `0${value}`;
  }
  return value;
};

const formatDate = function (date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  const millisecond = pad1000(date.getMilliseconds());
  return `${year}.${month}.${day} ${hour}:${minute}:${second}.${millisecond}`;
};

class Log {
  static increment({ name, count = 1 }) {
    datadog.increment(name, count);
  }

  static add({ name, info }) {
    // eslint-disable-next-line no-console
    console.log(`[${formatDate()} ${info}: ${name}]`);

    Log.increment({ name });
  }

  // Must be called inside methods with itself context trough .call(this)
  static method({
    name,
    user,
    username = user ? user.username : '',
  }) {
    const ip = this.connection.clientAddress;

    // eslint-disable-next-line no-console
    console.log(`[${formatDate()} ${username} (${ip}): ${name}]`);
    Log.increment({ name: `call.${name}` });
  }
}

export default Log;
