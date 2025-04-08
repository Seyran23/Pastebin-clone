module.exports = class PasteDto {
  id;
  createdBy;
  name;
  category;
  exposure;
  expiration_time;
  link_endpoint;

  constructor(model) {
    this.id = model.id;
    this.createdBy = model.createdBy;
    this.name = model.name;
    this.category = model.category;
    this.exposure = model.exposure;
    this.expiration_time = model.expiration_time;
    this.link_endpoint = model.link_endpoint;
  }
};
