import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './PageIndex.html';
import './PageIndex.styl';


class PageIndex extends BlazeComponent {
  template() {
    return 'PageIndex';
  }
}

PageIndex.register('PageIndex');

export default PageIndex;
