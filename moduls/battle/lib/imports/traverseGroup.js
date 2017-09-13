let traverseGroup = function(group, callback) {
  for (let armyName in group) {
    if (!group.hasOwnProperty(armyName)) {
      continue;
    }
    let army = group[armyName];

    for (let typeName in army) {
      if (!army.hasOwnProperty(typeName)) {
        continue;
      }

      let armyUnits = army[typeName];

      for (let unitName in armyUnits) {
        if (!armyUnits.hasOwnProperty(unitName)) {
          continue;
        }

        callback(armyName, typeName, unitName, armyUnits[unitName]);
      }
    }
  }
};

export default traverseGroup;