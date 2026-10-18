import { AppError } from '../utils/errors.js';
export function notFoundRoute(req,res){res.status(404).json({error:'Ruta no encontrada',ruta:req.originalUrl});}
export function errorHandler(err,req,res,_next){
 if(err instanceof AppError)return res.status(err.status).json({error:err.message,code:err.code});
 if(err.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Ya existe un registro con un dato único (correo, DNI, RUC, pago o recepción)',code:'DUPLICATE'});
 if(err.code==='ER_NO_REFERENCED_ROW_2')return res.status(400).json({error:'La referencia solicitada no existe',code:'FOREIGN_KEY'});
 if(err.code==='ER_CHECK_CONSTRAINT_VIOLATED')return res.status(400).json({error:'El dato no cumple una restricción de la base',code:'CHECK_FAILED'});
 if(err.code==='ER_LOCK_DEADLOCK'||err.code==='ER_LOCK_WAIT_TIMEOUT')return res.status(409).json({error:'Operación concurrente: intente nuevamente',code:'CONCURRENT_OPERATION'});
 if(err instanceof SyntaxError && 'body' in err)return res.status(400).json({error:'JSON inválido',code:'INVALID_JSON'});
 console.error('[API]',req.method,req.path,err);
 res.status(500).json({error:'Error interno del servidor',code:'INTERNAL_ERROR'});
}
