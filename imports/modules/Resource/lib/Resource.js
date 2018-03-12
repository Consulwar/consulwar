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
}

export default Resource;
