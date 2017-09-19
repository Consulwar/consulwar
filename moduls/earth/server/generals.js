class Generals {
  static reCalculate() {
    Generals.clearCurrents();

    Game.EarthZones.getAll().forEach(function (zone) {
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
      const power = Game.Unit.calculateUnitsPower(army.userArmy);
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
}

export default Generals;
