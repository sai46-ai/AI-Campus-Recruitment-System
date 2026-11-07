export class AppError extends Error {
  public status: string;
  public isOperational = true;
  constructor(message: string, public statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
