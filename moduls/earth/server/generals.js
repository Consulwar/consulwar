import { Command, ResponseToGeneral } from '../lib/generals';

class Generals {
  static reCalculate() {
    Generals.clearCurrents();

    Game.EarthZones.getAll().forEach((zone) => {
      Generals.calculate(zone);
    });
  }

  static clearCurrents() {
    Game.EarthZones.Collection.update({}, { $unset: { general: 1 } }, { multi: true });
  }

  static calculate(zone) {
    let maxPower = -Infinity;
    let maxUser;

    Game.EarthUnits.Collection.find({ zoneName: zone.name }).forEach(function (army) {
      const power = Game.Unit.calculateUnitsPower(army.userArmy, true);
      if (power > maxPower) {
        maxPower = power;
        maxUser = army.username;
      }
    });

    if (maxUser) {
      Game.EarthZones.Collection.update({
        _id: zone._id,
      }, {
        $set: {
          general: {
            username: maxUser,
          },
        },
      });
    }
  }

  static finishCommandsTime() {
    Game.EarthZones.Collection.update({
      general: { $exists: true },
      'general.command': { $exists: false },
    }, {
      $set: {
        'general.command': Command.NONE,
      },
    }, {
      multi: true,
    });
  }
}

Generals.Command = Command;
Generals.ResponseToGeneral = ResponseToGeneral;

export default Generals;
