import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import './Gallery.html';
import './Gallery.styl';

class Gallery extends BlazeComponent {
  template() {
    return 'Gallery';
  }

  constructor({
    hash: {
      slides = [],
      title = '',
    },
  }) {
    super();

    this.title = title;
    this.slides = slides;

    this.gallerySize = this.slides.length;

    this.slides.forEach((item, index) => {
      this.slides[index].loaded = new ReactiveVar(false);
    });

    this.currentIndex = new ReactiveVar(0);
    this.showSlide(null, 0);
  }

  isLast(index) {
    if (index === this.slides.length - 1) {
      return true;
    }
    return false;
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
    this.preloadSlide(index);
    this.currentIndex.set(index);

    this.preloadSlide(this.getNextIndex());
  }

  getNextIndex() {
    let current = this.currentIndex.get();
    if (current !== this.slides.length - 1) {
      current += 1;
    }
    return current;
  }

  getPreviousIndex() {
    let current = this.currentIndex.get();
    if (current !== 0) {
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

  close() {
    this.removeComponent();
  }
}

Gallery.register('Gallery');

export default Gallery;
