import { bad } from '../utils/errors.js';
import { emailValue, optionalString, stringValue } from '../utils/validation.js';

// MODELO: estructura y reglas de los campos de la tabla 'usuarios'.
export function createUsuarioModel(input, passwordHash) {
  const tipo=String(input.tipoPersona??input.tipo??'natural').toUpperCase();
  if(!['NATURAL','JURIDICA'].includes(tipo)) throw bad('tipoPersona debe ser natural o juridica');
  const telefono=stringValue(input.telefono,'telefono',20);
  const email=emailValue(input.email);
  const base={tipo_persona:tipo,telefono,email,password_hash:passwordHash};
  if(tipo==='NATURAL'){
    const dni=stringValue(input.dni,'dni',8);
    if(!/^\d{8}$/.test(dni)) throw bad('El DNI debe tener 8 dígitos');
    const fecha=input.fechaNacimiento??input.fecha_nacimiento;
    if(fecha!==undefined&&fecha!==null&&fecha!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw bad('fechaNacimiento debe ser AAAA-MM-DD');
    return {...base,nombre:stringValue(input.nombre,'nombre',100),apellido:stringValue(input.apellido,'apellido',100),dni,
      fecha_nacimiento:fecha||null,direccion:optionalString(input.direccion,'direccion')};
  }
  const ruc=stringValue(input.ruc,'ruc',11);
  if(!/^\d{11}$/.test(ruc)) throw bad('El RUC debe tener 11 dígitos');
  return {...base,razon_social:stringValue(input.razonSocial,'razonSocial',160),ruc,
    representante:stringValue(input.representante,'representante',120),
    cargo:optionalString(input.cargo,'cargo',100),rubro:optionalString(input.rubro,'rubro',120),
    direccion:optionalString(input.direccion,'direccion')};
}
export function publicUsuario(row) {
  if(!row) return null;
  const tipo=row.tipo_persona==='JURIDICA'?'juridica':'natural';
  return {id:row.id_usuario,tipoPersona:tipo, tipo, rol:row.rol,
    nombre:row.nombre??null,apellido:row.apellido??null,dni:row.dni??null,
    fechaNacimiento:row.fecha_nacimiento??null,razonSocial:row.razon_social??null,
    ruc:row.ruc??null,representante:row.representante??null,
    cargo:row.cargo??null,rubro:row.rubro??null,direccion:row.direccion??null,
    telefono:row.telefono,email:row.email,
    displayName:tipo==='juridica'?row.razon_social:[row.nombre,row.apellido].filter(Boolean).join(' ')};
}
