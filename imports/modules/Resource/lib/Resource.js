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
  }

  getIcon() {
    return `/img/game/${this.id}/icon.png`;
  }

  getCard() {
    return `/img/game/${this.id}/card.jpg`;
  }

  // legacy
  icon() {
    return this.getIcon();
  }

  image() {
    return this.getCard();
  }
}

export default Resource;
