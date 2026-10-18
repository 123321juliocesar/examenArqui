export class AppError extends Error {
  constructor(message, status=400, code='INVALID_REQUEST') {
    super(message); this.name='AppError'; this.status=status; this.code=code;
  }
}
export const bad = (message) => new AppError(message,400,'VALIDATION_ERROR');
export const notFound = (message='Recurso no encontrado') => new AppError(message,404,'NOT_FOUND');
export const conflict = (message) => new AppError(message,409,'CONFLICT');
export const forbidden = () => new AppError('No tiene permisos para esta acción',403,'FORBIDDEN');
export const unauthorized = () => new AppError('Autenticación requerida o inválida',401,'UNAUTHORIZED');
