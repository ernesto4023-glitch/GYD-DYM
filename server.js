const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Carpetas
const publicPath = path.join(__dirname, "public");
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

const categoriasPath = path.join(uploadsPath, "categorias");
const flyersPath = path.join(uploadsPath, "flyers");
const productosPath = path.join(uploadsPath, "productos");
const comprobantesPath = path.join(uploadsPath, "comprobantes");
const ejerciciosPath = path.join(uploadsPath, "ejercicios");
const publicidadPath = path.join(uploadsPath, "publicidad");

[
  uploadsPath,
  categoriasPath,
  flyersPath,
  productosPath,
  comprobantesPath,
  ejerciciosPath,
  publicidadPath
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Crear carpeta uploads/categorias si no existe
if (!fs.existsSync(categoriasPath)) {
  fs.mkdirSync(categoriasPath, { recursive: true });
}

// Archivos estáticos
app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



// Páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});



/* =========================
   FLYERS
========================= */

if (!fs.existsSync(flyersPath)) {
  fs.mkdirSync(flyersPath, { recursive: true });
}

const storageFlyers = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, flyersPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadFlyer = multer({
  storage: storageFlyers,
});

app.get("/flyers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM flyers ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post(
  "/flyers",
  uploadFlyer.fields([
    { name: "imagen_desktop", maxCount: 1 },
    { name: "imagen_mobile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const archivoDesktop = req.files?.imagen_desktop?.[0];
      const archivoMobile = req.files?.imagen_mobile?.[0];

      if (!archivoDesktop || !archivoMobile) {
        return res.status(400).json({
          message: "Debes subir una imagen para PC y una imagen para celular",
        });
      }

      const imagenDesktop = `uploads/flyers/${archivoDesktop.filename}`;
      const imagenMobile = `uploads/flyers/${archivoMobile.filename}`;

      // Dejamos imagen como respaldo para compatibilidad con código viejo
      const imagen = imagenDesktop;

      const [result] = await db.query(
        `
        INSERT INTO flyers 
        (imagen, imagen_desktop, imagen_mobile) 
        VALUES (?, ?, ?)
        `,
        [imagen, imagenDesktop, imagenMobile]
      );

      res.json({
        id: result.insertId,
        imagen,
        imagen_desktop: imagenDesktop,
        imagen_mobile: imagenMobile,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

app.delete("/flyers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM flyers WHERE id = ?", [id]);

    res.json({
      message: "Flyer eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put(
  "/flyers/:id",
  uploadFlyer.fields([
    { name: "imagen_desktop", maxCount: 1 },
    { name: "imagen_mobile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [flyerActual] = await db.query(
        "SELECT imagen, imagen_desktop, imagen_mobile FROM flyers WHERE id = ?",
        [id]
      );

      if (flyerActual.length === 0) {
        return res.status(404).json({
          message: "Flyer no encontrado",
        });
      }

      const archivoDesktop = req.files?.imagen_desktop?.[0];
      const archivoMobile = req.files?.imagen_mobile?.[0];

      let imagenDesktop =
        flyerActual[0].imagen_desktop || flyerActual[0].imagen;

      let imagenMobile =
        flyerActual[0].imagen_mobile ||
        flyerActual[0].imagen_desktop ||
        flyerActual[0].imagen;

      if (archivoDesktop) {
        imagenDesktop = `uploads/flyers/${archivoDesktop.filename}`;
      }

      if (archivoMobile) {
        imagenMobile = `uploads/flyers/${archivoMobile.filename}`;
      }

      const imagen = imagenDesktop;

      await db.query(
        `
        UPDATE flyers 
        SET imagen = ?, imagen_desktop = ?, imagen_mobile = ? 
        WHERE id = ?
        `,
        [imagen, imagenDesktop, imagenMobile, id]
      );

      res.json({
        message: "Flyer actualizado correctamente",
        imagen,
        imagen_desktop: imagenDesktop,
        imagen_mobile: imagenMobile,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);
/* =========================
   MULTER CATEGORÍAS
========================= */

const storageCategorias = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriasPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadCategoria = multer({
  storage: storageCategorias,
});

/* =========================
   MULTER EJERCICIOS
========================= */

const carpetaEjercicios = ejerciciosPath;

if (!fs.existsSync(carpetaEjercicios)) {
  fs.mkdirSync(carpetaEjercicios, { recursive: true });
}

const storageEjercicios = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaEjercicios);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreArchivo = `ejercicio-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nombreArchivo);
  }
});

const uploadEjercicio = multer({
  storage: storageEjercicios
});

/* =========================
   MULTER PUBLICIDAD
========================= */

const carpetaPublicidad = publicidadPath;

if (!fs.existsSync(carpetaPublicidad)) {
  fs.mkdirSync(carpetaPublicidad, { recursive: true });
}

const storagePublicidad = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaPublicidad);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreArchivo = `publicidad-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nombreArchivo);
  }
});

const uploadPublicidad = multer({
  storage: storagePublicidad
});

/* =========================
   CATEGORÍAS
========================= */

app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/categorias", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !req.file) {
      return res.status(400).json({
        message: "Nombre e imagen son obligatorios",
      });
    }

    const imagen = `uploads/categorias/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO categorias(nombre, imagen) VALUES (?, ?)",
      [nombre, imagen]
    );

    res.json({
      id: result.insertId,
      nombre,
      imagen,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/categorias/:id", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    let query = "UPDATE categorias SET nombre = ? WHERE id = ?";
    let values = [nombre, id];

    if (req.file) {
      const imagen = `uploads/categorias/${req.file.filename}`;
      query = "UPDATE categorias SET nombre = ?, imagen = ? WHERE id = ?";
      values = [nombre, imagen, id];
    }

    await db.query(query, values);

    res.json({
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

/*==========================
   ELIMINAR CATEGORIA
========================= */

app.delete("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [categoria] = await db.query(
      "SELECT imagen FROM categorias WHERE id = ?",
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    await db.query("DELETE FROM categorias WHERE id = ?", [id]);

    res.json({
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   PRODUCTOS
========================= */

if (!fs.existsSync(productosPath)) {
  fs.mkdirSync(productosPath, { recursive: true });
}

const storageProducto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productosPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  },
});

const uploadProducto = multer({
  storage: storageProducto,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.get("/productos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      ORDER BY productos.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      WHERE productos.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});


app.post(
  "/productos",
  uploadProducto.fields([
    { name: "imagenes", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      const {
        nombre,
        precio,
        descripcion,
        categoria_id,
        marca,
        variantes,
        tipo_producto
      } = req.body;

      if (!nombre || !precio || !descripcion || !categoria_id || !variantes) {
        return res.status(400).json({
          message: "Faltan campos obligatorios",
          recibido: req.body
        });
      }

      const imagenesFiles = req.files?.imagenes || [];

      if (imagenesFiles.length === 0) {
        return res.status(400).json({
          message: "Debes subir mínimo una imagen",
        });
      }

      const imagenPrincipal = `uploads/productos/${imagenesFiles[0].filename}`;

      const imagenes = imagenesFiles.map(file => {
        return `uploads/productos/${file.filename}`;
      });

      const [result] = await db.query(
        `INSERT INTO productos 
        (
          nombre, precio, descripcion, imagen, imagenes,
          categoria_id, marca, variantes, tipo_producto
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          precio,
          descripcion,
          imagenPrincipal,
          JSON.stringify(imagenes),
          categoria_id,
          marca || "",
          variantes,
          tipo_producto || "normal"
        ]
      );

      res.json({
        id: result.insertId,
        nombre,
        precio,
        descripcion,
        imagen: imagenPrincipal,
        imagenes,
        categoria_id,
        marca: marca || "",
        variantes,
        tipo_producto: tipo_producto || "normal"
      });

    } catch (error) {
      console.error("ERROR REAL:", error);

      res.status(500).json({
        message: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code
      });
    }
  }
);


app.delete("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [producto] = await db.query(
      "SELECT imagen, imagenes FROM productos WHERE id = ?",
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    await db.query("DELETE FROM productos WHERE id = ?", [id]);

    res.json({
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/productos/:id", uploadProducto.array("imagenes", 6), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      precio,
      descripcion,
      categoria_id,
      marca,
      variantes,
      tipo_producto
    } = req.body;

    if (!nombre || !precio || !descripcion || !categoria_id || !variantes) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        recibido: req.body
      });
    }

    let imagenPrincipal = req.body.imagenActual || "";
    let imagenes = req.body.imagenesActuales || "[]";

    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `uploads/productos/${file.filename}`);
      imagenPrincipal = nuevasImagenes[0];
      imagenes = JSON.stringify(nuevasImagenes);
    }

    await db.query(
      `UPDATE productos SET
        nombre = ?,
        precio = ?,
        descripcion = ?,
        imagen = ?,
        imagenes = ?,
        categoria_id = ?,
        marca = ?,
        variantes = ?,
        tipo_producto = ?
      WHERE id = ?`,
      [
        nombre,
        precio,
        descripcion,
        imagenPrincipal,
        imagenes,
        categoria_id,
        marca || "",
        variantes,
        tipo_producto || "normal",
        id
      ]
    );

    res.json({
      message: "Producto actualizado correctamente"
    });

  } catch (error) {
    console.error("ERROR REAL:", error);

    res.status(500).json({
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});
/* =========================
   PEDIDOS
========================= */

const storageComprobantes = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobantesPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  }
});

const uploadComprobante = multer({
  storage: storageComprobantes
});

app.post("/pedidos", uploadComprobante.single("comprobante"), async (req, res) => {
  try {
    const {
      nombre,
      whatsapp,
      correo,
      direccion,
      ciudad,
      metodo_pago,
      productos,
      total,
      moneda,
      notas
    } = req.body;

    if (!nombre || !whatsapp || !direccion || !ciudad || !metodo_pago || !productos || !total) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        recibido: req.body,
        archivos: req.files
      });
    }

    const comprobante = req.file
      ? `uploads/comprobantes/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `INSERT INTO pedidos
      (
        nombre, whatsapp, correo, direccion, ciudad,
        metodo_pago, comprobante, productos, total, moneda, notas
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        whatsapp,
        correo || "",
        direccion,
        ciudad,
        metodo_pago,
        comprobante,
        productos,
        total,
        moneda || "COP",
        notas || ""
      ]
    );

    res.json({
      id: result.insertId,
      message: "Pedido creado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM pedidos
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/pedidos/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["Activo", "Revisado", "En camino", "Entregado"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado no válido"
      });
    }

    await db.query(
      "UPDATE pedidos SET estado = ? WHERE id = ?",
      [estado, id]
    );

    res.json({
      message: "Estado actualizado correctamente",
      estado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.delete("/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM pedidos WHERE id = ?",
      [id]
    );

    res.json({
      message: "Pedido eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar pedido:", error);

    res.status(500).json({
      message: "No se pudo eliminar el pedido",
      error: error.message
    });
  }
});

/* =========================
   GRUPOS MUSCULARES
========================= */

app.get("/grupos-musculares", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        gm.*,
        COUNT(e.id) AS total_ejercicios
      FROM grupos_musculares gm
      LEFT JOIN ejercicios e ON e.grupo_id = gm.id
      GROUP BY gm.id
      ORDER BY gm.orden ASC, gm.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener grupos musculares:", error);
    res.status(500).json({
      message: "Error al obtener grupos musculares"
    });
  }
});

app.post("/grupos-musculares", async (req, res) => {
  try {
    const { nombre, descripcion, orden } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        message: "El nombre del músculo es obligatorio"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO grupos_musculares 
      (nombre, descripcion, orden) 
      VALUES (?, ?, ?)
      `,
      [
        nombre.trim(),
        descripcion || "",
        Number(orden || 0)
      ]
    );

    res.json({
      id: result.insertId,
      nombre: nombre.trim(),
      descripcion: descripcion || "",
      orden: Number(orden || 0),
      estado: "activo"
    });

  } catch (error) {
    console.error("Error al crear grupo muscular:", error);
    res.status(500).json({
      message: "Error al crear grupo muscular"
    });
  }
});

app.put("/grupos-musculares/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, estado } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        message: "El nombre del músculo es obligatorio"
      });
    }

    await db.query(
      `
      UPDATE grupos_musculares
      SET nombre = ?, descripcion = ?, orden = ?, estado = ?
      WHERE id = ?
      `,
      [
        nombre.trim(),
        descripcion || "",
        Number(orden || 0),
        estado || "activo",
        id
      ]
    );

    res.json({
      message: "Músculo actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar grupo muscular:", error);
    res.status(500).json({
      message: "Error al actualizar grupo muscular"
    });
  }
});

app.delete("/grupos-musculares/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM grupos_musculares WHERE id = ?",
      [id]
    );

    res.json({
      message: "Músculo eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar grupo muscular:", error);
    res.status(500).json({
      message: "Error al eliminar grupo muscular"
    });
  }
});

app.get("/asistencias", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.fecha,
        c.nombre,
        c.cedula,
        c.whatsapp,
        c.plan,
        c.estado
      FROM asistencias a
      INNER JOIN clientes c ON c.id = a.cliente_id
      ORDER BY a.fecha DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    res.status(500).json({
      message: "Error al obtener asistencias",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});


/* =========================
   EJERCICIOS
========================= */

app.get("/ejercicios", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*,
        gm.nombre AS grupo_nombre
      FROM ejercicios e
      LEFT JOIN grupos_musculares gm ON gm.id = e.grupo_id
      ORDER BY e.grupo_id ASC, e.orden ASC, e.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ejercicios:", error);
    res.status(500).json({
      message: "Error al obtener ejercicios"
    });
  }
});

app.get("/ejercicios/grupo/:grupo_id", async (req, res) => {
  try {
    const { grupo_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        e.*,
        gm.nombre AS grupo_nombre
      FROM ejercicios e
      LEFT JOIN grupos_musculares gm ON gm.id = e.grupo_id
      WHERE e.grupo_id = ?
      ORDER BY e.orden ASC, e.id DESC
      `,
      [grupo_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ejercicios por grupo:", error);
    res.status(500).json({
      message: "Error al obtener ejercicios por grupo"
    });
  }
});

app.post("/ejercicios", uploadEjercicio.single("imagen"), async (req, res) => {
  try {
    const {
      grupo_id,
      nombre,
      repeticiones,
      descripcion,
      orden
    } = req.body;

    if (!grupo_id) {
      return res.status(400).json({
        message: "Selecciona un músculo"
      });
    }

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        message: "El nombre del ejercicio es obligatorio"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "La imagen del ejercicio es obligatoria"
      });
    }

    const imagen = `uploads/ejercicios/${req.file.filename}`;

    const [result] = await db.query(
      `
      INSERT INTO ejercicios 
      (grupo_id, nombre, repeticiones, descripcion, imagen, orden)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        grupo_id,
        nombre.trim(),
        repeticiones || "",
        descripcion || "",
        imagen,
        Number(orden || 0)
      ]
    );

    res.json({
      id: result.insertId,
      grupo_id,
      nombre: nombre.trim(),
      repeticiones: repeticiones || "",
      descripcion: descripcion || "",
      imagen,
      orden: Number(orden || 0),
      estado: "activo"
    });

  } catch (error) {
    console.error("Error al crear ejercicio:", error);
    res.status(500).json({
      message: "Error al crear ejercicio"
    });
  }
});

app.put("/ejercicios/:id", uploadEjercicio.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      grupo_id,
      nombre,
      repeticiones,
      descripcion,
      orden,
      estado
    } = req.body;

    if (!grupo_id) {
      return res.status(400).json({
        message: "Selecciona un músculo"
      });
    }

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        message: "El nombre del ejercicio es obligatorio"
      });
    }

    const [actual] = await db.query(
      "SELECT imagen FROM ejercicios WHERE id = ?",
      [id]
    );

    if (actual.length === 0) {
      return res.status(404).json({
        message: "Ejercicio no encontrado"
      });
    }

    let imagen = actual[0].imagen;

    if (req.file) {
      imagen = `uploads/ejercicios/${req.file.filename}`;
    }

    await db.query(
      `
      UPDATE ejercicios
      SET 
        grupo_id = ?,
        nombre = ?,
        repeticiones = ?,
        descripcion = ?,
        imagen = ?,
        orden = ?,
        estado = ?
      WHERE id = ?
      `,
      [
        grupo_id,
        nombre.trim(),
        repeticiones || "",
        descripcion || "",
        imagen,
        Number(orden || 0),
        estado || "activo",
        id
      ]
    );

    res.json({
      message: "Ejercicio actualizado correctamente",
      imagen
    });

  } catch (error) {
    console.error("Error al actualizar ejercicio:", error);
    res.status(500).json({
      message: "Error al actualizar ejercicio"
    });
  }
});

app.delete("/ejercicios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM ejercicios WHERE id = ?",
      [id]
    );

    res.json({
      message: "Ejercicio eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar ejercicio:", error);
    res.status(500).json({
      message: "Error al eliminar ejercicio"
    });
  }
});

app.get("/debug-db", async (req, res) => {
  try {
    const [dbActual] = await db.query("SELECT DATABASE() AS base_actual");
    const [tablas] = await db.query("SHOW TABLES");

    res.json({
      ok: true,
      base_actual: dbActual[0].base_actual,
      tablas
    });
  } catch (error) {
    console.error("ERROR DEBUG DB:", error);

    res.status(500).json({
      ok: false,
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/* =========================
   CLIENTES
========================= */

app.get("/clientes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        *,
        DATEDIFF(fecha_fin, CURDATE()) AS dias_restantes,
        CASE
          WHEN fecha_fin < CURDATE() THEN 'vencido'
          WHEN DATEDIFF(fecha_fin, CURDATE()) <= 3 THEN 'por_vencer'
          ELSE 'activo'
        END AS estado_plan
      FROM clientes
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      message: "Error al obtener clientes",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { nombre, cedula, whatsapp, plan } = req.body;

    if (!nombre || !cedula || !whatsapp || !plan) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const diasPorPlan = {
      diario: 1,
      semanal: 7,
      mensual: 30
    };

    const diasPlan = diasPorPlan[plan];

    if (!diasPlan) {
      return res.status(400).json({
        message: "Plan no válido"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO clientes
      (nombre, cedula, whatsapp, plan, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))
      `,
      [
        nombre.trim(),
        cedula.trim(),
        whatsapp.trim(),
        plan,
        diasPlan
      ]
    );

    res.json({
      id: result.insertId,
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      whatsapp: whatsapp.trim(),
      plan,
      estado: "activo"
    });

  } catch (error) {
    console.error("Error al registrar cliente:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Ya existe un cliente con esa cédula"
      });
    }

    res.status(500).json({
      message: "Error al registrar cliente",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.get("/clientes/cedula/:cedula", async (req, res) => {
  try {
    const { cedula } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        *,
        DATEDIFF(fecha_fin, CURDATE()) AS dias_restantes,
        CASE
          WHEN fecha_fin < CURDATE() THEN 'vencido'
          WHEN DATEDIFF(fecha_fin, CURDATE()) <= 3 THEN 'por_vencer'
          ELSE 'activo'
        END AS estado_plan
      FROM clientes
      WHERE cedula = ?
      LIMIT 1
      `,
      [cedula]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).json({
      message: "Error al buscar cliente",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});



/* =========================
   ASISTENCIAS
========================= */

app.get("/asistencias", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.fecha,
        c.nombre,
        c.cedula,
        c.whatsapp,
        c.plan,
        c.estado
      FROM asistencias a
      INNER JOIN clientes c ON c.id = a.cliente_id
      ORDER BY a.fecha DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error al obtener asistencias:", error);

    res.status(500).json({
      message: "Error al obtener asistencias",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.post("/asistencias", async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({
        message: "La cédula es obligatoria"
      });
    }

    const [clientes] = await db.query(
      `
      SELECT *
      FROM clientes
      WHERE cedula = ?
      LIMIT 1
      `,
      [cedula.trim()]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    const cliente = clientes[0];

    const [result] = await db.query(
      `
      INSERT INTO asistencias
      (cliente_id)
      VALUES (?)
      `,
      [cliente.id]
    );

    res.json({
      message: "Asistencia registrada correctamente",
      asistencia_id: result.insertId,
      cliente
    });

  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({
      message: "Error al registrar asistencia",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.delete("/asistencias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM asistencias WHERE id = ?",
      [id]
    );

    res.json({
      message: "Asistencia eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar asistencia:", error);

    res.status(500).json({
      message: "Error al eliminar asistencia",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/*METRICA DE DASHBOARD */
/* =========================
   DASHBOARD MÉTRICAS
========================= */

app.get("/dashboard-metricas", async (req, res) => {
  try {
    const [[clientes]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM clientes
    `);

    const [[productos]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM productos
    `);

    const [[pedidos]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM pedidos
    `);

    let ventasTotales = 0;
    let columnaTotalUsada = null;

    const [columnasPedidos] = await db.query(`
      SHOW COLUMNS FROM pedidos
    `);

    const columnas = columnasPedidos.map(columna => columna.Field);

    const posiblesColumnasTotal = [
      "total",
      "total_pedido",
      "valor_total",
      "monto_total",
      "precio_total"
    ];

    columnaTotalUsada = posiblesColumnasTotal.find(columna => {
      return columnas.includes(columna);
    });

    if (columnaTotalUsada) {
      const [[ventas]] = await db.query(`
        SELECT COALESCE(SUM(${columnaTotalUsada}), 0) AS total 
        FROM pedidos
      `);

      ventasTotales = Number(ventas.total || 0);
    }

    res.json({
      ventas_totales: ventasTotales,
      pedidos: Number(pedidos.total || 0),
      clientes: Number(clientes.total || 0),
      productos: Number(productos.total || 0),
      columna_total_usada: columnaTotalUsada
    });

  } catch (error) {
    console.error("Error al cargar métricas del dashboard:", error);

    res.status(500).json({
      message: "Error al cargar métricas del dashboard",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});
/*_____________________*/

/* =========================
   DASHBOARD GRÁFICAS
========================= */

app.get("/dashboard-graficas", async (req, res) => {
  try {
    const periodo = req.query.periodo || "dia";

    let groupBy = "";
    let label = "";
    let whereFecha = "";

    if (periodo === "dia") {
      groupBy = "DATE(a.fecha)";
      label = "DATE_FORMAT(a.fecha, '%d/%m')";
      whereFecha = "a.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
    } else if (periodo === "mes") {
      groupBy = "DATE_FORMAT(a.fecha, '%Y-%m')";
      label = "DATE_FORMAT(a.fecha, '%m/%Y')";
      whereFecha = "a.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    } else if (periodo === "anio") {
      groupBy = "YEAR(a.fecha)";
      label = "YEAR(a.fecha)";
      whereFecha = "a.fecha >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)";
    } else {
      return res.status(400).json({
        message: "Periodo no válido"
      });
    }

    const [barras] = await db.query(`
      SELECT 
        ${label} AS etiqueta,
        COUNT(*) AS total
      FROM asistencias a
      WHERE ${whereFecha}
      GROUP BY ${groupBy}
      ORDER BY MIN(a.fecha) ASC
    `);

    const [pastel] = await db.query(`
      SELECT 
        c.plan AS etiqueta,
        COUNT(*) AS total
      FROM asistencias a
      INNER JOIN clientes c ON c.id = a.cliente_id
      WHERE ${whereFecha}
      GROUP BY c.plan
      ORDER BY total DESC
    `);

    res.json({
      barras: {
        labels: barras.map(item => item.etiqueta),
        valores: barras.map(item => Number(item.total || 0))
      },
      pastel: {
        labels: pastel.map(item => item.etiqueta),
        valores: pastel.map(item => Number(item.total || 0))
      }
    });

  } catch (error) {
    console.error("Error al cargar gráficas:", error);

    res.status(500).json({
      message: "Error al cargar gráficas",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/*_____________________________________________________*/

/* =========================
   COMENTARIOS CLIENTES
========================= */

app.get("/comentarios-clientes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM comentarios_clientes
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);

    res.status(500).json({
      message: "Error al obtener comentarios",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.post("/comentarios-clientes", async (req, res) => {
  try {
    const { nombre, comentario } = req.body;

    if (!nombre || !comentario) {
      return res.status(400).json({
        message: "Nombre y comentario son obligatorios"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO comentarios_clientes
      (nombre, comentario)
      VALUES (?, ?)
      `,
      [
        nombre.trim(),
        comentario.trim()
      ]
    );

    res.json({
      id: result.insertId,
      nombre: nombre.trim(),
      comentario: comentario.trim(),
      estado: "activo"
    });

  } catch (error) {
    console.error("Error al guardar comentario:", error);

    res.status(500).json({
      message: "Error al guardar comentario",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.delete("/comentarios-clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM comentarios_clientes WHERE id = ?",
      [id]
    );

    res.json({
      message: "Comentario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar comentario:", error);

    res.status(500).json({
      message: "Error al eliminar comentario",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/*_________________________________________________________________ */

/* =========================
   PUBLICIDAD Y EVENTOS
========================= */

app.get("/publicidad-eventos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM publicidad_eventos
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error al obtener publicidad:", error);

    res.status(500).json({
      message: "Error al obtener publicidad",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.post("/publicidad-eventos", uploadPublicidad.single("imagen"), async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      tipo,
      enlace,
      whatsapp,
      fecha_inicio,
      fecha_fin
    } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({
        message: "Título y descripción son obligatorios"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "La imagen es obligatoria"
      });
    }

    const imagen = `uploads/publicidad/${req.file.filename}`;

    const [result] = await db.query(
      `
      INSERT INTO publicidad_eventos
      (titulo, descripcion, imagen, tipo, enlace, whatsapp, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        titulo.trim(),
        descripcion.trim(),
        imagen,
        tipo || "publicidad",
        enlace || null,
        whatsapp || null,
        fecha_inicio || null,
        fecha_fin || null
      ]
    );

    res.json({
      id: result.insertId,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      imagen,
      tipo: tipo || "publicidad",
      enlace: enlace || null,
      whatsapp: whatsapp || null,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      estado: "activo"
    });

  } catch (error) {
    console.error("Error al guardar publicidad:", error);

    res.status(500).json({
      message: "Error al guardar publicidad",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.delete("/publicidad-eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM publicidad_eventos WHERE id = ?",
      [id]
    );

    res.json({
      message: "Publicidad eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar publicidad:", error);

    res.status(500).json({
      message: "Error al eliminar publicidad",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/* =========================
   RESERVAS EVENTO
========================= */

app.post("/reservas-evento", async (req, res) => {
  try {
    const { nombre, cedula, cantidad_cupos } = req.body;

    if (!nombre || !cedula || !cantidad_cupos) {
      return res.status(400).json({
        message: "Nombre, cédula y cantidad de cupos son obligatorios"
      });
    }

    const cantidad = Number(cantidad_cupos);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        message: "La cantidad de cupos debe ser válida"
      });
    }

    const valorCupo = 25000;
    const total = cantidad * valorCupo;

    const [result] = await db.query(
      `
      INSERT INTO reservas_evento
      (nombre, cedula, cantidad_cupos, valor_cupo, total)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        nombre.trim(),
        cedula.trim(),
        cantidad,
        valorCupo,
        total
      ]
    );

    res.json({
      message: "Reserva registrada correctamente",
      reserva_id: result.insertId,
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      cantidad_cupos: cantidad,
      valor_cupo: valorCupo,
      total
    });

  } catch (error) {
    console.error("Error al registrar reserva:", error);

    res.status(500).json({
      message: "Error al registrar reserva",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});