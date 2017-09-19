import Calibrator from '../Calibrator/server';
import Mechanic from '../Mechanic/server';
import NatalyVerlen from '../NatalyVerlen/server';
import Tamily from '../Tamily/server';
import ThirdEngineering from '../ThirdEngineering/server';

export default {
  ...Calibrator,
  ...Mechanic,
  ...NatalyVerlen,
  ...Tamily,
  ...ThirdEngineering,
};
