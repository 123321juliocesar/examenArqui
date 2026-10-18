-- ============================================================================
-- TIENDA ANDINA - BASE DE DATOS RELACIONAL PARA 5 PROCESOS DE NEGOCIO
-- Compatible con MySQL 8.0.16+ / MariaDB 10.6+
-- Frontend: React + TypeScript | Backend propuesto: Node.js + Express
-- Incluye: registro, busqueda predictiva, filtros, compras y control de stock.
-- NO incluye: pasarela online, dashboard, recomendador, facturacion, analiticas.
-- IMPORTANTE: Cobros contraentrega manuales. SIMULADO = prueba, no dinero real.
-- No elimina otras bases. No guarda contrasenas en texto plano.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS tienda_andina_5_procesos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tienda_andina_5_procesos;

-- 1. USUARIOS: personas naturales, juridicas y administradores.
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_persona ENUM('NATURAL','JURIDICA') NOT NULL DEFAULT 'NATURAL',
  rol ENUM('CLIENTE','ADMIN') NOT NULL DEFAULT 'CLIENTE',
  nombre VARCHAR(100) NULL,
  apellido VARCHAR(100) NULL,
  dni CHAR(8) NULL,
  fecha_nacimiento DATE NULL,
  razon_social VARCHAR(160) NULL,
  ruc CHAR(11) NULL,
  representante VARCHAR(120) NULL,
  cargo VARCHAR(100) NULL,
  rubro VARCHAR(120) NULL,
  direccion VARCHAR(255) NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT uq_usuarios_dni UNIQUE (dni),
  CONSTRAINT uq_usuarios_ruc UNIQUE (ruc),
  CONSTRAINT chk_usuarios_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- 2. CATEGORIAS: permite filtrar por categoria.
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_categorias_nombre UNIQUE (nombre),
  CONSTRAINT chk_categoria_activa CHECK (activa IN (0,1))
) ENGINE=InnoDB;

-- 3. PRODUCTOS: catalogo, autocomplete, precio y existencias reales.
CREATE TABLE IF NOT EXISTS productos (
  id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imagen_url VARCHAR(700) NULL,
  etiqueta VARCHAR(60) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_producto_precio CHECK (precio >= 0),
  CONSTRAINT chk_producto_stock CHECK (stock >= 0),
  CONSTRAINT chk_producto_activo CHECK (activo IN (0,1)),
  INDEX idx_productos_busqueda (nombre),
  INDEX idx_productos_filtro (id_categoria, activo, precio, stock)
) ENGINE=InnoDB;

-- 4. PROVEEDORES: origen de compras para reposicion.
CREATE TABLE IF NOT EXISTS proveedores (
  id_proveedor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  ruc CHAR(11) NULL,
  contacto VARCHAR(120) NULL,
  telefono VARCHAR(20) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_proveedores_nombre UNIQUE (nombre),
  CONSTRAINT uq_proveedores_ruc UNIQUE (ruc)
) ENGINE=InnoDB;

-- 5. COMPRAS_PROVEEDOR: solicitud que origina el abastecimiento.
CREATE TABLE IF NOT EXISTS compras_proveedor (
  id_compra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT UNSIGNED NOT NULL,
  id_responsable INT UNSIGNED NOT NULL,
  estado ENUM('GENERADA','RECIBIDA','ANULADA') NOT NULL DEFAULT 'GENERADA',
  observacion VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recibido_en DATETIME NULL,
  CONSTRAINT fk_compras_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedores(id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_compras_responsable FOREIGN KEY (id_responsable)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_compras_estado (estado, creado_en)
) ENGINE=InnoDB;

-- 6. COMPRA_DETALLES: productos y cantidades solicitadas al proveedor.
CREATE TABLE IF NOT EXISTS compra_detalles (
  id_compra_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_compra INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
  CONSTRAINT uq_compra_producto UNIQUE (id_compra, id_producto),
  CONSTRAINT fk_compra_detalles_compra FOREIGN KEY (id_compra)
    REFERENCES compras_proveedor(id_compra) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_compra_detalles_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_compra_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_compra_costo CHECK (costo_unitario >= 0)
) ENGINE=InnoDB;

-- 7. RECEPCIONES_PROVEEDOR: una recepcion completa por orden (MVP simplificado).
-- UNIQUE(id_compra) ayuda a impedir que la misma orden se reciba dos veces.
CREATE TABLE IF NOT EXISTS recepciones_proveedor (
  id_recepcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_compra INT UNSIGNED NOT NULL,
  id_usuario_recibe INT UNSIGNED NOT NULL,
  observacion VARCHAR(255) NULL,
  fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_recepcion_compra UNIQUE (id_compra),
  CONSTRAINT fk_recepciones_compra FOREIGN KEY (id_compra)
    REFERENCES compras_proveedor(id_compra) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_recepciones_usuario FOREIGN KEY (id_usuario_recibe)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. PEDIDOS: pedido que el usuario confirma desde el carrito.
CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  estado ENUM('CONFIRMADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'CONFIRMADO',
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  direccion_entrega VARCHAR(255) NULL,
  notas VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  entregado_en DATETIME NULL,
  id_usuario_cierra INT UNSIGNED NULL,
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_cierra FOREIGN KEY (id_usuario_cierra)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_pedidos_total CHECK (total >= 0),
  INDEX idx_pedidos_usuario (id_usuario, creado_en),
  INDEX idx_pedidos_estado (estado, creado_en)
) ENGINE=InnoDB;

-- 9. PEDIDO_DETALLES: cada articulo comprado con precio historico.
CREATE TABLE IF NOT EXISTS pedido_detalles (
  id_pedido_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  CONSTRAINT uq_pedido_producto UNIQUE (id_pedido, id_producto),
  CONSTRAINT fk_pedido_detalles_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_detalles_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_detalle_pedido_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_pedido_precio CHECK (precio_unitario >= 0)
) ENGINE=InnoDB;

-- 10. PAGOS: registro MANUAL del cobro contraentrega o prueba simulada.
-- No procesa tarjetas ni se conecta a pasarelas.
CREATE TABLE IF NOT EXISTS pagos (
  id_pago INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT UNSIGNED NOT NULL,
  id_usuario_registra INT UNSIGNED NOT NULL,
  medio ENUM('EFECTIVO','TRANSFERENCIA','SIMULADO') NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  referencia VARCHAR(100) NULL,
  observacion VARCHAR(255) NULL,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_pago_pedido UNIQUE (id_pedido),
  CONSTRAINT fk_pagos_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_usuario FOREIGN KEY (id_usuario_registra)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_pago_monto CHECK (monto > 0)
) ENGINE=InnoDB;

-- 11. MOVIMIENTOS_STOCK: entradas por compra / salidas por pedido.
-- Referencias permiten auditar el origen de cada movimiento.
-- Las restricciones UNIQUE protegen contra duplicar el mismo movimiento.
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id_movimiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto INT UNSIGNED NOT NULL,
  tipo ENUM('ENTRADA_PROVEEDOR','SALIDA_VENTA') NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  id_compra INT UNSIGNED NULL,
  id_pedido INT UNSIGNED NULL,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimientos_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimientos_compra FOREIGN KEY (id_compra)
    REFERENCES compras_proveedor(id_compra) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimientos_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_movimiento_compra_producto UNIQUE (id_compra,id_producto),
  CONSTRAINT uq_movimiento_pedido_producto UNIQUE (id_pedido,id_producto),
  CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_movimiento_stock CHECK (stock_anterior >= 0 AND stock_nuevo >= 0),
  CONSTRAINT chk_movimiento_origen CHECK (
    (tipo = 'ENTRADA_PROVEEDOR' AND id_compra IS NOT NULL AND id_pedido IS NULL
       AND stock_nuevo = stock_anterior + cantidad)
    OR
    (tipo = 'SALIDA_VENTA' AND id_pedido IS NOT NULL AND id_compra IS NULL
       AND stock_nuevo = stock_anterior - cantidad)
  ),
  INDEX idx_movimientos_producto_fecha (id_producto, registrado_en)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- VISTAS de SOLO LECTURA: ayudan al frontend y a la sustentacion.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_catalogo AS
SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
       p.imagen_url, p.etiqueta, c.id_categoria,
       c.nombre AS categoria
FROM productos p
INNER JOIN categorias c ON c.id_categoria = p.id_categoria
WHERE p.activo = 1 AND c.activa = 1;

CREATE OR REPLACE VIEW vw_stock_bajo AS
SELECT p.id_producto, p.nombre, c.nombre AS categoria, p.stock
FROM productos p
JOIN categorias c ON c.id_categoria = p.id_categoria
WHERE p.activo = 1 AND p.stock <= 5;

CREATE OR REPLACE VIEW vw_ventas_cerradas AS
SELECT pe.id_pedido, pe.id_usuario, pe.total, pe.estado,
       pe.entregado_en, pa.medio, pa.monto, pa.registrado_en
FROM pedidos pe
JOIN pagos pa ON pa.id_pedido = pe.id_pedido
WHERE pe.estado = 'ENTREGADO';

-- --------------------------------------------------------------------------
-- DATOS DE PRUEBA DEL CATALOGO EXISTENTE EN Products.tsx.
-- Conservamos ID 1..8 para simplificar la migracion del frontend de Figma.
-- No insertamos usuarios porque deben registrarse desde el backend, usando
-- bcrypt o argon2 para password_hash. Nunca guardar password en claro.
-- --------------------------------------------------------------------------
INSERT INTO categorias (id_categoria,nombre)
VALUES (1,'Lácteos'),(2,'Cereales'),(3,'Miel')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO proveedores (id_proveedor,nombre,contacto,telefono)
VALUES (1,'Productores de Apurímac','Contacto de demostración','900000000')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO productos
  (id_producto,id_categoria,nombre,descripcion,precio,stock,imagen_url,etiqueta,activo)
VALUES
 (1,1,'Yogur de Lúcuma','Cremoso, con lúcuma peruana fresca. Sin conservantes.',6.50,15,
 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=500&h=500&fit=crop&auto=format','Más vendido',1),
 (2,1,'Yogur Natural Stevia','Yogur natural endulzado con stevia andina, ligero y nutritivo.',6.50,15,
 'https://images.unsplash.com/photo-1733197012835-e99ebf3c914d?w=500&h=500&fit=crop&auto=format',NULL,1),
 (3,1,'Queso Fresco Artesanal','Queso de leche entera, elaborado a mano en Abancay.',12.00,4,
 'https://images.unsplash.com/photo-1632200729570-1043effd1b77?w=500&h=500&fit=crop&auto=format','Nuevo',1),
 (4,2,'Quinua Orgánica 500g','Quinua blanca del altiplano, 100% orgánica y certificada.',9.90,20,
 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=500&h=500&fit=crop&auto=format',NULL,1),
 (5,2,'Kiwicha Andina 400g','Kiwicha tostada, alta en proteína. Perfecta para desayunos.',8.50,20,
 'https://images.unsplash.com/photo-1705147271933-5c7052f15a90?w=500&h=500&fit=crop&auto=format',NULL,1),
 (6,3,'Miel Pura de Apurímac','Miel de abeja 100% pura, sin mezclas ni aditivos. 500 ml.',18.00,10,
 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop&auto=format','Premium',1),
 (7,1,'Manjar Blanco 250g','Manjar blanco artesanal de leche fresca de vaca criolla.',7.50,10,
 'https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=500&h=500&fit=crop&auto=format',NULL,1),
 (8,1,'Mantequilla Andina 200g','Mantequilla sin sal, elaborada con leche de vaca criolla.',10.00,10,
 'https://images.unsplash.com/photo-1667499823726-f2c6fc321b66?w=500&h=500&fit=crop&auto=format',NULL,1)
ON DUPLICATE KEY UPDATE id_producto=id_producto;
-- NOTA: si se vuelve a importar, no se reinicia el stock de productos existentes.

-- --------------------------------------------------------------------------
-- CONSULTAS DE VERIFICACION INMEDIATA PARA EL PROFESOR.
-- --------------------------------------------------------------------------
SELECT 'Tablas y productos cargados' AS verificacion;
SELECT id_producto, nombre, categoria, precio, stock FROM vw_catalogo ORDER BY id_producto;
SELECT id_producto, nombre, stock FROM vw_stock_bajo ORDER BY stock;

-- --------------------------------------------------------------------------
-- RECETAS DE CONSULTA PARA EL BACKEND (COMENTADAS: requieren parametros).
-- El backend usa consultas preparadas y transacciones con UNA MISMA CONEXION.
-- --------------------------------------------------------------------------

-- PROCESO 1: CREAR CUENTA
-- INSERT INTO usuarios (tipo_persona, nombre, apellido, dni,
--                       fecha_nacimiento,telefono,email,password_hash)
-- VALUES ('NATURAL', ?, ?, ?, ?, ?, ?, ?);
-- SELECT id_usuario,tipo_persona,rol,nombre,apellido,email FROM usuarios
-- WHERE email = ? AND activo = 1;
-- Nunca enviar password_hash al navegador. Comparar hashes en backend.

-- PROCESO 2: BUSCAR 'qui' (autocomplete; usar ? para texto suministrado)
-- SELECT id_producto, nombre, precio, imagen_url, stock
-- FROM vw_catalogo
-- WHERE nombre LIKE CONCAT('%', ?, '%')
-- ORDER BY nombre LIMIT 8;

-- PROCESO 3: FILTROS COMBINADOS (categoria, precio_min, precio_max)
-- SELECT * FROM vw_catalogo
-- WHERE id_categoria = ? AND precio BETWEEN ? AND ? AND stock > 0
-- ORDER BY precio;
-- Para filtros opcionales, construir WHERE dinamico en el backend con ?.

-- PROCESO 4: CONFIRMAR PEDIDO (ejecutar COMO TRANSACCION en PedidosService)
-- 1) BEGIN;
-- 2) SELECT id_producto, precio, stock, activo FROM productos
--    WHERE id_producto IN (...) ORDER BY id_producto FOR UPDATE;
-- 3) Validar en backend: cantidad > 0, activos, stock >= cantidad.
--    Calcular precio y total DESDE LA BASE DE DATOS, no desde React.
-- 4) INSERT INTO pedidos (id_usuario,estado,total,direccion_entrega)
--    VALUES (?, 'CONFIRMADO', ?, ?);
-- 5) Por cada producto:
--    INSERT INTO pedido_detalles(id_pedido,id_producto,cantidad,precio_unitario)
--      VALUES (?,?,?,?);
--    UPDATE productos SET stock = stock - ?
--      WHERE id_producto = ? AND stock >= ?;
--    Comprobar affectedRows = 1.
--    INSERT INTO movimientos_stock
--      (id_producto,tipo,cantidad,stock_anterior,stock_nuevo,id_pedido)
--      VALUES (?,'SALIDA_VENTA',?,?,?,?);
-- 6) COMMIT; si falla algo, ROLLBACK.
-- NOTA: ni vista ni trigger descuentan stock. SOLO PedidosService.

-- PROCESO 5: ABASTECIMIENTO (en ComprasService / InventarioService)
-- CREAR ORDEN: INSERT compras_proveedor y compra_detalles en una transaccion.
-- RECIBIR EN TRANSACCION:
-- 1) SELECT estado FROM compras_proveedor WHERE id_compra=? FOR UPDATE;
--    Debe ser 'GENERADA'.
-- 2) INSERT INTO recepciones_proveedor(id_compra,id_usuario_recibe)
--    VALUES(?,?); UNIQUE(id_compra) impide segunda recepcion.
-- 3) Obtener compra_detalles y bloquear productos con SELECT ... FOR UPDATE.
-- 4) Por cada detalle: UPDATE productos SET stock = stock + ? WHERE id_producto = ?;
--    INSERT INTO movimientos_stock
--      (id_producto,tipo,cantidad,stock_anterior,stock_nuevo,id_compra)
--      VALUES (?,'ENTRADA_PROVEEDOR',?,?,?,?);
-- 5) UPDATE compras_proveedor SET estado='RECIBIDA',recibido_en=NOW()
--    WHERE id_compra=? AND estado='GENERADA'; COMMIT o ROLLBACK.

-- CERRAR VENTA CONTRAENTREGA (sin pasarela; en una sola transaccion)
-- 1) SELECT estado,total FROM pedidos WHERE id_pedido=? FOR UPDATE;
--    Debe ser 'CONFIRMADO'; validar que el monto cobrado coincide con total.
-- 2) INSERT INTO pagos(id_pedido,id_usuario_registra,medio,monto,referencia)
--    VALUES (?,?,'EFECTIVO',?,NULL); -- o SIMULADO solo en demostracion
-- 3) UPDATE pedidos SET estado='ENTREGADO',entregado_en=NOW(),id_usuario_cierra=?
--    WHERE id_pedido=? AND estado='CONFIRMADO'; COMMIT o ROLLBACK.
-- UNIQUE pagos.id_pedido evita cobros duplicados por doble clic.

-- LISTA DE PEDIDOS POR USUARIO
-- SELECT id_pedido,estado,total,creado_en,entregado_en
-- FROM pedidos WHERE id_usuario=? ORDER BY creado_en DESC;

-- MOVIMIENTOS DE UN PRODUCTO
-- SELECT tipo,cantidad,stock_anterior,stock_nuevo,id_compra,id_pedido,
--        registrado_en FROM movimientos_stock WHERE id_producto=?
-- ORDER BY id_movimiento;
