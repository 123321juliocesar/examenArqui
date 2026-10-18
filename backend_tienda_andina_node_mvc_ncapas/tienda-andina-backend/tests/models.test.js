import test from 'node:test';
import assert from 'node:assert/strict';
import { createUsuarioModel,publicUsuario } from '../src/models/Usuario.js';
import { orderAmount } from '../src/models/Pedido.js';
import { parseFilters } from '../src/models/Filtro.js';
import { itemsNormalized,costItemsNormalized,decimalCents } from '../src/utils/validation.js';

test('Persona natural se guarda en columnas MySQL y sin rol admin',()=>{
 const u=createUsuarioModel({tipo:'natural',nombre:'Ana',apellido:'Pérez',dni:'12345678',telefono:'912345678',email:'ANA@EJEMPLO.COM'},'hash');
 assert.equal(u.tipo_persona,'NATURAL'); assert.equal(u.email,'ana@ejemplo.com');
 assert.equal(u.password_hash,'hash');assert.ok(!Object.hasOwn(u,'rol'));
});
test('Persona jurídica mapea datos de AuthModal',()=>{
 const u=createUsuarioModel({tipo:'juridica',razonSocial:'Empresa S.A.C.',ruc:'20123456789',representante:'Ana',telefono:'912345678',email:'empresa@ejemplo.pe'},'hash');
 assert.equal(u.razon_social,'Empresa S.A.C.');assert.equal(u.ruc,'20123456789');
});
test('Salida pública nunca incluye contraseña',()=>{
 const u=publicUsuario({id_usuario:1,rol:'CLIENTE',tipo_persona:'NATURAL',nombre:'Ana',apellido:'P',email:'a@a.com',password_hash:'secreto'});
 assert.equal(u.displayName,'Ana P');assert.equal(u.password_hash,undefined);
});
test('Pedido calcula 2 unidades × 9.90 y 1 unidad × 6.50 con precio de BD',()=>{
 const p=new Map([[4,{precio:'9.90'}],[1,{precio:'6.50'}]]);
 const result=orderAmount([{idProducto:1,cantidad:1},{idProducto:4,cantidad:2}],p);
 assert.equal(result.total,'26.30');assert.equal(result.detail[1].subtotal,'19.80');
});
test('Rechaza ítems duplicados, cantidades decimales y costo negativo',()=>{
 assert.throws(()=>itemsNormalized([{id:1,qty:1},{id:1,qty:2}]));
 assert.throws(()=>itemsNormalized([{id:1,qty:0.4}]));
 assert.throws(()=>costItemsNormalized([{id:1,qty:2,costoUnitario:-1}]));
});
test('Filtros validados y protegen ORDER/LIMIT SQL',()=>{
 assert.deepEqual(parseFilters({categoria:'1',precioMax:'15',disponible:'true',limit:'8'}),{q:'',categoria:1,precioMax:'15.00',disponible:true,limit:8});
 assert.throws(()=>parseFilters({limit:'0; DROP TABLE usuarios'}));
 assert.throws(()=>parseFilters({precioMin:25,precioMax:5}));
});
test('Centavos evita errores de coma flotante',()=>{
 assert.equal(decimalCents('19.80'),1980); assert.equal(decimalCents(0.3),30);
});
