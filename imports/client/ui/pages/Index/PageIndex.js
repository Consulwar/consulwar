import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
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
    this.currentSlide = new ReactiveVar(this.slides[0]);
    this.autoSwitcher = setInterval(() => this.goNext(), 5000);
  }

  setSlide(event, slide) {
    if (event) {
      clearInterval(this.autoSwitcher);
    }
    this.currentSlide.set(slide);
  }

  isCurrent(slider) {
    if (slider === this.currentSlide.get()) {
      return true;
    }
    return false;
  }

  getCurrentIndex() {
    return _.indexOf(this.slides, this.currentSlide.get());
  }

  goNext(event) {
    let current = this.getCurrentIndex();
    if (current === this.slides.length - 1) {
      current = 0;
    } else {
      current += 1;
    }
    this.setSlide(event || null, this.slides[current]);
  }

  goBack(event) {
    let current = this.getCurrentIndex();
    if (current === 0) {
      current = this.slides.length - 1;
    } else {
      current -= 1;
    }
    this.setSlide(event || null, this.slides[current]);
  }
}

PageIndex.register('PageIndex');

export default PageIndex;
