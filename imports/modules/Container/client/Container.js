import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { Notifications } from '/moduls/game/lib/importCompability';
import helpers from '/imports/client/ui/helpers';
import ResourceSingle from '/imports/client/ui/blocks/Resource/Single/ResourceSingle';
import LibContainer from '../lib/Container';

class Container extends LibContainer {
  constructor(options) {
    super(options);

    const idParts = this.id.split('/');
    switch (idParts[idParts.length - 1]) {
      case 'White':
        this.color = 'cw--color_white';
        break;
      case 'Green':
        this.color = 'cw--color_credit';
        break;
      case 'Blue':
        this.color = 'cw--color_metal';
        break;
      case 'Purple':
        this.color = 'cw--color_crystal';
        break;
      case 'Orange':
        this.color = 'cw--color_human';
        break;
      case 'Red':
        this.color = 'cw--color_honor';
        break;

      default:
        this.color = 'cw--color_white';
        break;
    }
  }

  buy({
    count = 1,
    onSuccess = () => Notifications.success('Контейнера приобретены'),
  }) {
    const price = ResourceSingle.renderComponentToHTML(null, null, {
      resources: this.getPrice({ count }),
    });

    const word = helpers.declension(count, 'контейнер', '', 'а', 'ов');

    Game.showAcceptWindow(
      `Приобрести ${count} ${word} за ${price}`,
      () => Meteor.call(
        'Building/Residential/SpacePort.buyContainer',
        {
          id: this.id,
          count,
        },
        (error) => {
          if (error) {
            Notifications.error('Не удалось приобрести контейнера', error.error);
          } else {
            onSuccess();
          }
        },
      ),
      () => null,
    );
  }
}

export default Container;
