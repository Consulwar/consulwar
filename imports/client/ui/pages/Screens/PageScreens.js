import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import './PageScreens.html';
import './PageScreens.styl';

class PageScreens extends BlazeComponent {
  template() {
    return 'PageScreens';
  }
  onCreated() {
    super.onCreated();
    this.images = [
      {
        title: 'Жилой район',
        thumb: '/img/screenshots/1p.jpg',
        img: '/img/screenshots/1.jpg',
      },
      {
        title: 'Военный район',
        thumb: '/img/screenshots/2p.jpg',
        img: '/img/screenshots/2.jpg',
      },
      {
        title: 'Исследования',
        thumb: '/img/screenshots/3p.jpg',
        img: '/img/screenshots/3.jpg',
      },
      {
        title: 'Войска: Космический флот',
        thumb: '/img/screenshots/4p.jpg',
        img: '/img/screenshots/4.jpg',
      },
      {
        title: 'Войска: Планетарная оборона',
        thumb: '/img/screenshots/5p.jpg',
        img: '/img/screenshots/5.jpg',
      },
      {
        title: 'Войска: Армия',
        thumb: '/img/screenshots/6p.jpg',
        img: '/img/screenshots/6.jpg',
      },
      {
        title: 'Космос',
        thumb: '/img/screenshots/7p.jpg',
        img: '/img/screenshots/7.jpg',
      },
      {
        title: 'Земля',
        thumb: '/img/screenshots/8p.jpg',
        img: '/img/screenshots/8.jpg',
      },
      {
        title: 'Квесты',
        thumb: '/img/screenshots/9p.jpg',
        img: '/img/screenshots/9.jpg',
      },
    ];
    this.currentImgUrl = new ReactiveVar(this.images[0].img);
  }

  setImg(event, url) {
    this.currentImgUrl.set(url);
    this.find('.cw--PageScreens__theater').classList.add('cw--PageScreens__theaterShow');
  }

  closeScreen() {
    this.find('.cw--PageScreens__theater').classList.remove('cw--PageScreens__theaterShow');
  }

  isCurrent(url) {
    return url === this.currentImgUrl.get();
  }

  goNext() {
    let current = _.findIndex(this.images, image => image.img === this.currentImgUrl.get());
    if (current === this.images.length - 1) {
      current = 0;
    } else {
      current += 1;
    }
    this.setImg(null, this.images[current].img);
  }

  goBack() {
    let current = _.findIndex(this.images, image => image.img === this.currentImgUrl.get());
    if (current === 0) {
      current = this.images.length - 1;
    } else {
      current -= 1;
    }
    this.setImg(null, this.images[current].img);
  }
}

PageScreens.register('PageScreens');

export default PageScreens;
