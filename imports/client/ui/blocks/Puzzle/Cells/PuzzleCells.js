import { $ } from 'meteor/jquery';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import resourceItems from '/imports/content/Resource/client';
import './PuzzleCells.html';
import './PuzzleCells.styl';

class PuzzleCells extends BlazeComponent {
  template() {
    return 'PuzzleCells';
  }

  constructor({
    hash: {
      cells,
      answers,
      onCellClick = () => {},
      onDrop = () => {},
      className,
    },
  }) {
    super();

    this.cells = cells;
    this.answers = answers;
    this.onCellClick = onCellClick;
    this.onDrop = (e, cell) => {
      this.unhighlight(e);
      onDrop(e, cell);
    };
    this.className = className;
  }

  highlight(e) {
    e.preventDefault();
    $(e.target).addClass('cw--PuzzleCells__cell_highlight');
  }

  unhighlight(e) {
    $(e.target).removeClass('cw--PuzzleCells__cell_highlight');
  }

  answer(cell) {
    if (resourceItems[this.answers.get()[cell]]) {
      return {
        [resourceItems[this.answers.get()[cell]].id]: 1,
      };
    }
    return this.answers.get()[cell];
  }

  hasAnswer(cell) {
    return this.answer(cell) ? 'cw--PuzzleCells__cell_answered' : null;
  }
}

PuzzleCells.register('PuzzleCells');

export default PuzzleCells;
