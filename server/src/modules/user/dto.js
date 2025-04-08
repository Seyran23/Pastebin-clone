module.exports = class UserDto {
    id;
    username;
    email;
    role;
    isActivated;
    avatar;
    location;

    constructor(model) {
        this.id = model.id;
        this.username = model.username;
        this.email = model.email;
        this.role = model.role;
        this.isActivated = model.isActivated;
        this.avatar = model.avatar;
        this.location = model.location;

    }
}