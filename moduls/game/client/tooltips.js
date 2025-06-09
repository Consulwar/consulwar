// Defaults
var DIRECTION_MAP, 
Tooltip,
center, 
dep, 
getTooltip, 
hideTooltip, 
horizontally, 
offset, 
positionTooltip, 
setClasses, 
setPosition, 
setTooltip, 
showTooltip, 
toggleTooltip, 
vertically;

Tooltip = {
  text: false,
  css: {
    top: 0,
    left: 0
  },
  direction: 'tooltip--top',
  classes: ''
};

dep = new Tracker.Dependency();

offset = [10, 
  10];

DIRECTION_MAP = {
  'n': 'tooltip--top',
  's': 'tooltip--bottom',
  'e': 'tooltip--right',
  'w': 'tooltip--left'
};

// Tooltip functions
getTooltip = function() {
  dep.depend();
  return Tooltip;
};

setTooltip = function(what, 
  where) {
  if (where) {
    Tooltip.css = where;
  }
  Tooltip.text = what;
  return dep.changed();
};

setPosition = function(position, 
  direction) {
  Tooltip.css = position;
  if (direction) {
    Tooltip.direction = DIRECTION_MAP[direction];
  }
  return dep.changed();
};

setClasses = function(classes) {
  return Tooltip.classes = classes || '';
};

hideTooltip = function() {
  return setTooltip(false);
};

toggleTooltip = function() {
  if (getTooltip().text) {
    return hideTooltip();
  } else {
    return showTooltip(null, $(this));
  }
};

positionTooltip = function($el) {
  var $tooltip, direction, hasOffsetLeft, hasOffsetTop, offLeft, offTop, position;
  direction = $el.attr('data-tooltip-direction') || 'n';
  $tooltip = $(".tooltip");
  position = $el.offset();
  offLeft = $el.attr('data-tooltip-left');
  offTop = $el.attr('data-tooltip-top');
  if (_.isUndefined(offLeft)) {
    offLeft = 0;
  } else {
    hasOffsetLeft = true;
  }
  if (_.isUndefined(offTop)) {
    offTop = 0;
  } else {
    hasOffsetTop = true;
  }
  position.top = (function() {
    switch (direction) {
      case 'w':
      case 'e':
        return (center(vertically($tooltip, $el))) + offTop;
      case 'n':
        return position.top - $tooltip.outerHeight() - (hasOffsetTop ? offTop : offset[1]);
      case 's':
        return position.top + $el.outerHeight() + (hasOffsetTop ? offTop : offset[1]);
    }
  })();
  position.left = (function() {
    switch (direction) {
      case 'n':
      case 's':
        return (center(horizontally($tooltip, $el))) + offLeft;
      case 'w':
        return position.left - $tooltip.outerWidth() - (hasOffsetLeft ? offLeft : offset[0]);
      case 'e':
        return position.left + $el.outerWidth() + (hasOffsetLeft ? offLeft : offset[0]);
    }
  })();
  return setPosition(position, direction);
};

showTooltip = function(evt, $el) {
  var $target, content, mq, selector, viewport;
  $el = $el || $(this);
  viewport = $el.attr('data-tooltip-disable');
  if (viewport && _.isString(viewport)) {
    mq = window.matchMedia(viewport);
    if (mq.matches) {
      return false;
    }
  }
  content = (selector = $el.attr('data-tooltip-element')) ? ($target = $(selector), $target.length && $target.html()) : $el.attr('data-tooltip');
  setTooltip(content);
  setPosition({
    top: 0,
    left: 0
  });
  setClasses($el.attr('data-tooltip-classes'));
  return Tracker.afterFlush(function() {
    return positionTooltip($el);
  });
};

// Positioning
center = function(args) {
  var middle;
  middle = args[0] + args[1] / 2;
  return middle - Math.round(args[2] / 2);
};

horizontally = function($el, $reference) {
  return [$reference.offset().left, $reference.outerWidth(), $el.outerWidth()];
};

vertically = function($el, $reference) {
  return [$reference.offset().top, $reference.outerHeight(), $el.outerHeight()];
};

// Exports
export const Tooltips = {
  disable: false,
  set: setTooltip,
  get: getTooltip,
  hide: hideTooltip,
  setPosition: setPosition
};

// Enable/disable for viewports
Template.tooltips.onCreated(function() {
  var mq;
  this.disabled = new ReactiveVar(Tooltips.disable);
  if (Tooltips.disable && _.isString(Tooltips.disable)) {
    mq = window.matchMedia(Tooltips.disable);
    this.disabled.set(mq.matches);
    return mq.addListener((changed) => {
      return this.disabled.set(changed.matches);
    });
  }
});

// Template helpers
Template.tooltips.helpers({
  display: function() {
    var tip;
    tip = getTooltip();
    if (Template.instance().disabled.get() === true) {
      return 'hide';
    }
    if (tip.text) {
      return 'show';
    } else {
      return 'hide';
    }
  },
  position: function() {
    var css;
    css = getTooltip().css;
    return `position: absolute; top: ${css.top}px; left: ${css.left}px;`;
  },
  content: function() {
    return getTooltip().text;
  },
  direction: function() {
    return getTooltip().direction;
  },
  classes: function() {
    return getTooltip().classes;
  }
});

// Init
Template.tooltip.onRendered(function() {
  return this.lastNode._uihooks = {
    insertElement: function(node, next) {
      return next.parentNode.insertBefore(node, next);
    },
    moveElement: function(node, next) {
      Tooltips.hide();
      return next.parentNode.insertBefore(node, next);
    },
    removeElement: function(node) {
      Tooltips.hide();
      return node.parentNode.removeChild(node);
    }
  };
});

Meteor.startup(function() {
  $(document).on('mouseover', '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]', showTooltip);
  $(document).on('mouseout', '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]', hideTooltip);
  $(document).on('click', '[data-tooltip-trigger="click"]', toggleTooltip);
  $(document).on('focus', '[data-tooltip-trigger="focus"]', showTooltip);
  $(document).on('blur', '[data-tooltip-trigger="focus"]', hideTooltip);
  $(document).on('tooltips:show', '[data-tooltip-trigger="manual"]', showTooltip);
  $(document).on('tooltips:hide', '[data-tooltip-trigger="manual"]', hideTooltip);
  return $(document).on('tooltips:toggle', '[data-tooltip-trigger="manual"]', toggleTooltip);
});
