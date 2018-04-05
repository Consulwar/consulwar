import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import UserWelcome from '/imports/client/ui/blocks/User/Welcome/UserWelcome';
import './PageIndex.html';
import './PageIndex.styl';


class PageIndex extends BlazeComponent {
  template() {
    return 'PageIndex';
  }
  onCreated() {
    super.onCreated();
    this.slides = [
      {
        title: 'Подготовь армию для освобождения Земли от захватчиков',
        img: '/img/mainPage/slide05.jpg',
      },
      {
        title: 'Строй боевые корабли и создай самый мощный флот в галактике',
        img: '/img/mainPage/slide04.jpg',
      },
      {
        title: 'Наводи страх на коварных и жестоких рептилоидов',
        img: '/img/mainPage/slide03.jpg',
        isRating18: true,
      },
      {
        title: 'Развивай индустрию, военное дело и экономику своей колонии',
        img: '/img/mainPage/slide02.jpg',
      },
      {
        title: 'Твоя планета готова, люди ждут приказов, Правитель',
        img: '/img/mainPage/slide01.jpg',
        isConsul: true,
      },
    ];
    this.slides.forEach((item, index) => {
      this.slides[index].loaded = new ReactiveVar(false);
    });

    this.currentIndex = new ReactiveVar(0);
    this.showSlide(null, 0);

    this.autoSwitcher = Meteor.setInterval(this.goNext.bind(this), 10000);
  }

  preloadSlide(index) {
    const slide = this.slides[index];
    if (!slide.image) {
      slide.image = new Image();
      slide.image.src = slide.img;

      slide.image.addEventListener('load', () => {
        slide.loaded.set(true);
      });
    }
  }

  showSlide(event, index) {
    if (event) {
      Meteor.clearInterval(this.autoSwitcher);
    }

    this.preloadSlide(index);
    this.currentIndex.set(index);

    this.preloadSlide(this.getNextIndex());
  }

  getNextIndex() {
    let current = this.currentIndex.get();
    if (current === this.slides.length - 1) {
      current = 0;
    } else {
      current += 1;
    }
    return current;
  }

  getPreviousIndex() {
    let current = this.currentIndex.get();
    if (current === 0) {
      current = this.slides.length - 1;
    } else {
      current -= 1;
    }
    return current;
  }

  goNext() {
    this.showSlide(null, this.getNextIndex());
  }

  goBack() {
    this.showSlide(null, this.getPreviousIndex());
  }

  getCurrentSlide() {
    return this.slides[this.currentIndex.get()];
  }

  scrollTo(event, target) {
    const headerSize = $('.cw--MainHeader').outerHeight();
    $('html, body').animate({
      scrollTop: ($(target).offset().top - headerSize),
    }, 1000);
  }

  showWelcomePopup() {
    Game.Popup.show({
      template: UserWelcome.renderComponent(),
      isMain: true,
    });
  }
}

PageIndex.register('PageIndex');

export default PageIndex;
