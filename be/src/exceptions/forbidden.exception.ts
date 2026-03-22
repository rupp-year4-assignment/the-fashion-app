import HttpException from "@utils/httpException";

export default class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
