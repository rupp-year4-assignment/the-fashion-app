import HttpException from "@utils/httpException";

export default class NotFoundException extends HttpException {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
