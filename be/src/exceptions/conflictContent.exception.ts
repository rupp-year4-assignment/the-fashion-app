import HttpException from "@utils/httpException";

export default class ConflictContentException extends HttpException {
  constructor(message = "Conflict") {
    super(409, message);
    this.name = "ConflictContentException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
