import HttpException from "@utils/httpException";

export default class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
