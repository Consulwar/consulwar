import { ReactiveVar } from 'meteor/reactive-var';

const target = new ReactiveVar();
const direction = new ReactiveVar('bottom');
const isShow = new ReactiveVar(false);

const show = (newTarget, newDirection) => {
  target.set(newTarget);
  direction.set(newDirection);
  isShow.set(true);
};

const hide = () => {
  isShow.set(false);
};

export {
  target,
  direction,
  isShow,
  show,
  hide,
};
