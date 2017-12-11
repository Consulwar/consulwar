import LibResource from '../lib/Resource';

class Resource extends LibResource {
  constructor(options) {
    super(options);

    const idParts = this.id.split('/');
    switch (idParts[idParts.length - 1]) {
      case 'Human':
        this.color = 'cw--color_human';
        break;
      case 'Metal':
        this.color = 'cw--color_metal';
        break;
      case 'Crystal':
        this.color = 'cw--color_crystal';
        break;
      case 'Honor':
        this.color = 'cw--color_honor';
        break;
      case 'Credit':
        this.color = 'cw--color_credit';
        break;

      default:
        this.color = 'cw--color_white';
        break;
    }
  }
}

export default Resource;
