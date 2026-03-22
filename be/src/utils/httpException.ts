export default class HttpException extends Error {
  public status: number;
  public message: string;
  public errors?: any;

  constructor(status = 500, message = "Something went wrong", errors?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
