import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import { Notifications } from '/moduls/game/lib/importCompability';
import '/imports/client/ui/icon/credits/iconCredits';
import './PersonSkinPopup.html';
import './PersonSkinPopup.styl';

class PersonSkinPopup extends BlazeComponent {
  template() {
    return 'PersonSkinPopup';
  }

  onCreated() {
    super.onCreated();

    this.person = this.data('person');
  }

  skins() {
    const availableSkins = this.person.getAvailableSkins();
    const activeSkins = this.person.getActiveSkins();

    return _(this.person.skin).pairs().map(([id, { isUnique = false, price }]) => ({
      id,
      has: availableSkins.indexOf(id) !== -1,
      isUnique,
      isActive: activeSkins.indexOf(id) !== -1,
      price,
    }));
  }

  changeMultiSkinOption() {
    Game.Settings.invertOption({
      name: 'isMultiSkinEnabled',
    });
  }

  skinAction(event, id) {
    const selectedSkin = _(this.skins()).find(skin => skin.id === id);
    const isMultiSkinEnabled = Game.Settings.getOption({ name: 'isMultiSkinEnabled' });
    if (selectedSkin.has) {
      if (!selectedSkin.isActive) {
        if (isMultiSkinEnabled) {
          this.setSkins([...this.person.getActiveSkins(), id]);
        } else {
          this.setSkins([id]);
        }
      } else if (!(this.person.getActiveSkins().length === 1 && id === 'default')) {
        this.setSkins(_(this.person.getActiveSkins()).without(id));
      }
    } else if (!selectedSkin.isUnique) {
      this.buySkin(id);
    }
  }

  setSkins(ids) {
    Meteor.call('Person.setActiveSkins', {
      personId: this.person.id,
      skinIds: ids,
    }, (error) => {
      if (error) {
        Notifications.error('Не удалось активировать скины', error.error);
      } else {
        Notifications.success('Скины активированы');
      }
    });
  }

  buySkin(id) {
    Meteor.call('Person.buySkin', {
      personId: this.person.id,
      skinId: id,
    }, (error) => {
      if (error) {
        Notifications.error('Не удалось приобрести скин', error.error);
      } else {
        Notifications.success('Скин куплен');
      }
    });
  }
}

PersonSkinPopup.register('PersonSkinPopup');

export default PersonSkinPopup;
