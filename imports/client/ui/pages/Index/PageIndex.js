import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
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
        title: 'Уникальная вселенная – со своими персонажами, историей и конфликтом',
        description: 'По игре выходит комикс, события которого развиваются так, как хочешь ты',
        img: '/img/mainSlider/slide05.jpg',
      },
      {
        title: 'Десятки космических кораблей, оборонных сооружений и других боевых единиц',
        description: 'Отстрой свой флот и получи контроль над галактикой',
        img: '/img/mainSlider/slide04.jpg',
      },
      {
        title: 'Совместные недетские сражения против кровавых Рептилоидов по всей галактике',
        description: 'Взрослый сеттинг с кровью, мясом и обнажёнкой',
        img: '/img/mainSlider/slide03.jpg',
        isRating18: true,
      },
      {
        title: 'Десятки строений, исследований и сотни уровней развития своей колонии',
        description: 'Начни с пустой планеты и застрой её самыми мощными сооружениями',
        img: '/img/mainSlider/slide02.jpg',
      },
      {
        title: 'Ты сам решаешь, как тебе править и какой стиль управления тебе выгоднее',
        description: 'Наладь добычу ресурсов и военного снабжения и правь твёрдой рукой',
        img: '/img/mainSlider/slide01.jpg',
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
}

PageIndex.register('PageIndex');

export default PageIndex;
