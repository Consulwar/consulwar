import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

class ShutdownHack {
  static monitor() {
    if (Meteor.settings.shutdownHackTimeout == null) {
      return;
    }

    let connections = 0;

    const disconnect = _.debounce(() => {
      if (connections <= 0) {
        console.log(`Process ${process.pid} shutting down due to inactivity`);
        process.kill(process.pid, 'SIGINT');
      }
    }, Meteor.settings.shutdownHackTimeout * 1000);

    Meteor.onConnection((connection) => {
      connections += 1;
      console.log(`Process ${process.pid} new connection`);
      connection.onClose(() => {
        connections -= 1;
        console.log(`Process ${process.pid} client disconnected`);
        if (connections <= 0) {
          disconnect();
        }
      });
    });
  }
}

export default ShutdownHack;
