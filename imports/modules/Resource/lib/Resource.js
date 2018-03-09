class Resource {
  constructor({
    id,
    title,
    description,
    legacyName,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;

    // legacy
    this.legacyName = legacyName;
    this.engName = legacyName;
    this.type = 'resource';

    this.icon = `/img/game/${this.id}/icon.svg`;
    this.card = `/img/game/${this.id}/card.jpg`;
  }
}

export default Resource;
