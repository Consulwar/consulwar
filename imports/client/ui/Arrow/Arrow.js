import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import ArrowControl from './ArrowControl';
import './Arrow.html';
import './Arrow.styl';

class Arrow extends BlazeComponent {
  template() {
    return 'Arrow';
  }

  onCreated() {
    super.onCreated();

    this.position = new ReactiveVar();
    this.isShow = ArrowControl.isShow;
  }

  onRendered() {
    super.onRendered();

    this.autorun(() => {
      if (ArrowControl.isShow.get()) {
        this.show(
          ArrowControl.target.get(),
          ArrowControl.direction.get(),
        );
      }
    });
  }

  setCoordinates(target, direction) {
    const targetData = {
      top: $(target).offset().top,
      left: $(target).offset().left,
      width: $(target).outerWidth(),
      height: $(target).outerHeight(),
    };

    let { top, left } = targetData;
    let rotation = '0deg';
    if (direction === 'top' || direction === 'bottom') {
      left = targetData.left + (targetData.width / 2);
    } else if (direction === 'right') {
      left = targetData.left + targetData.width;
    }
    if (direction === 'bottom') {
      top = targetData.top + (targetData.height);
    } else if (direction === 'left' || direction === 'right') {
      top = targetData.top + (targetData.height / 2);
    }
    if (direction === 'top') {
      rotation = '180deg';
    } else if (direction === 'left') {
      rotation = '90deg';
    } else if (direction === 'right') {
      rotation = '270deg';
    }
    this.position.set(`left: ${left}px; top: ${top}px; transform:rotate(${rotation})`);
  }

  show(target, direction) {
    this.isShow.set(true);
    this.setCoordinates(target, direction);
  }
}

Arrow.register('Arrow');

export default Arrow;
