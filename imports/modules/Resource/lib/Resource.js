class Resource {
  constructor({
    id,
    title,
    description,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  getIcon() {
    return `/img/game/${this.id}/icon.png`;
  }
}

export default Resource;
