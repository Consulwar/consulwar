import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './PageAbout.html';
import './PageAbout.styl';

class PageAbout extends BlazeComponent {
  template() {
    return 'PageAbout';
  }
}

PageAbout.register('PageAbout');

export default PageAbout;
