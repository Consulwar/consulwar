import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Paging.html';
import './Paging.styl';

class Paging extends BlazeComponent {
  template() {
    return 'Paging';
  }

  constructor({
    hash: {
      size,
      currentPage,
      pagesTotal,
      isShowArrows = true,
      className,
    },
  }) {
    super();

    this.currentPage = currentPage;
    this.pagesTotal = pagesTotal;
    this.isShowArrows = isShowArrows;
    this.className = className;

    this.size = size || 7;
  }

  getRange(start, end) {
    const pages = [];
    for (let i = start; i <= end; i += 1) {
      const page = {
        count: i,
      };
      if (i === this.currentPage.get()) {
        page.isCurrent = true;
      }
      pages.push(page);
    }
    return pages;
  }

  getLast() {
    return [{}, { count: this.pagesTotal.get() }];
  }
  getFirst() {
    return [{ count: 1 }, {}];
  }

  pages() {
    let pages = [];
    const space = (this.size - 5) / 2;
    const currentPage = this.currentPage.get() || 1;

    if (!this.pagesTotal.get()) {
      return false;
    }

    if (this.pagesTotal.get() < this.size) {
      pages = pages.concat(this.getRange(1, this.pagesTotal.get()));
    } else if (currentPage <= (space * 2) + 1) {
      pages = pages.concat(
        this.getRange(1, (this.size - 2)),
        this.getLast(),
      );
    } else if (currentPage >= this.pagesTotal.get() - (space * 2)) {
      pages = pages.concat(
        this.getFirst(),
        this.getRange((this.pagesTotal.get() - (this.size - 3)), this.pagesTotal.get()),
      );
    } else {
      pages = pages.concat(
        this.getFirst(),
        this.getRange((currentPage - space), (currentPage + space)),
        this.getLast(),
      );
    }

    return pages;
  }

  switchPage(event, page = 'next') {
    const currentPage = this.currentPage.get();
    if (
      page === 'next'
      && currentPage < this.pagesTotal.get()
    ) {
      this.currentPage.set(currentPage + 1);
    } else if (
      page === 'back'
      && currentPage > 1
    ) {
      this.currentPage.set(currentPage - 1);
    } else if (
      (/^\d+$/).test(page)
      && page <= this.pagesTotal.get()
    ) {
      this.currentPage.set(page);
    }
  }
}

Paging.register('Paging');

export default Paging;
