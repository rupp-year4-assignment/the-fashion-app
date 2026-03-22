import HttpException from "@utils/httpException";

export default class BadRequestException extends HttpException {
  constructor(message = "Bad Request", errors?: any) {
    super(400, message, errors);
    this.name = "BadRequestException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
