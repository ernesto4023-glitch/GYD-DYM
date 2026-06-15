-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-06-2026 a las 03:28:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencias`
--

INSERT INTO `asistencias` (`id`, `cliente_id`, `fecha`) VALUES
(1, 1, '2026-05-31 16:42:29'),
(3, 2, '2026-05-31 17:49:52'),
(4, 3, '2026-06-03 12:52:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `imagen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `imagen`) VALUES
(3, 'Ropa', 'uploads/categorias/1778112533409-categoria-2.png'),
(4, 'Calzado', 'uploads/categorias/1778112547897-categoria-3.png'),
(5, 'Bolsos', 'uploads/categorias/1778112578407-categoria.png'),
(6, 'Guantes de Box', 'uploads/categorias/1780490333183-1583064817_511059_1592561581_noticia_normal.jpg'),
(7, 'Box / Artes Marciales', 'uploads/categorias/1780490250952-Captura-de-pantalla-(1).png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `cedula` varchar(30) NOT NULL,
  `whatsapp` varchar(30) NOT NULL,
  `plan` enum('diario','semanal','mensual') NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `cedula`, `whatsapp`, `plan`, `fecha_inicio`, `fecha_fin`, `estado`, `created_at`) VALUES
(1, 'Ernesto Parra', '23882107', '3233404121', 'semanal', '2026-05-31', '2026-06-07', 'activo', '2026-05-31 16:41:58'),
(2, 'Erika Marin', '1110468101', '3233404121', 'diario', '2026-05-31', '2026-06-01', 'activo', '2026-05-31 17:49:26'),
(3, 'Jaime Barreto', '79743092', '3142266029', 'mensual', '2026-06-03', '2026-07-03', 'activo', '2026-06-03 12:51:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios_clientes`
--

CREATE TABLE `comentarios_clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `comentario` text NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comentarios_clientes`
--

INSERT INTO `comentarios_clientes` (`id`, `nombre`, `comentario`, `estado`, `created_at`) VALUES
(2, 'Ernesto Parra', 'este es otro comentario de Prueba', 'activo', '2026-05-31 18:27:25'),
(3, 'Ernesto Parra', 'Habia una vez un barquito Chiquitico', 'activo', '2026-05-31 18:27:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `clave`, `valor`) VALUES
(1, 'tasa_cambio', '4000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios`
--

CREATE TABLE `ejercicios` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `repeticiones` varchar(80) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ejercicios`
--

INSERT INTO `ejercicios` (`id`, `grupo_id`, `nombre`, `repeticiones`, `descripcion`, `imagen`, `orden`, `estado`, `created_at`) VALUES
(2, 1, 'Barra media', '4 x 12', 'arriba y abajo', 'uploads/ejercicios/ejercicio-1780241321968-467317690.webp', 1, 'activo', '2026-05-31 15:22:20'),
(3, 1, 'Cruce de poleas para pecho bajo', '4 x 12', 'Este ejercicio se realiza de pie', 'uploads/ejercicios/ejercicio-1780244241488-469414241.png', 3, 'activo', '2026-05-31 15:23:19'),
(4, 3, 'Barra Delantera', '4 x 12', 'sube y baja', 'uploads/ejercicios/ejercicio-1780245430949-660862138.webp', 1, 'activo', '2026-05-31 16:37:10'),
(5, 3, 'Barra Trasera', '4 x 12', 'arriba y abajo', 'uploads/ejercicios/ejercicio-1780245465824-802689140.webp', 2, 'activo', '2026-05-31 16:37:45'),
(6, 3, 'Remo', '4 x 12', 'adelante y atras', 'uploads/ejercicios/ejercicio-1780245498570-613701698.webp', 3, 'activo', '2026-05-31 16:38:18'),
(7, 1, 'Barra Superior', '4 x 12', 'arriba y abajo', 'uploads/ejercicios/ejercicio-1780245549954-839007202.png', 2, 'activo', '2026-05-31 16:39:09'),
(8, 4, 'Prensa', '4 x 12', 'sube y baja', 'uploads/ejercicios/ejercicio-1780260857011-54617274.png', 1, 'activo', '2026-05-31 20:54:17'),
(9, 4, 'Sentadilla Bulgara', '4 x 12', 'baja y sube', 'uploads/ejercicios/ejercicio-1780260887806-944679746.png', 2, 'activo', '2026-05-31 20:54:47'),
(10, 4, 'Sentadilla Rusa', '4 x 12', 'baja y sube', 'uploads/ejercicios/ejercicio-1780260933023-913410912.png', 3, 'activo', '2026-05-31 20:55:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `flyers`
--

CREATE TABLE `flyers` (
  `id` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `imagen_desktop` varchar(255) DEFAULT NULL,
  `imagen_mobile` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `flyers`
--

INSERT INTO `flyers` (`id`, `imagen`, `imagen_desktop`, `imagen_mobile`) VALUES
(9, 'uploads/flyers/1780204681009-Banner1-con_texto.png', 'uploads/flyers/1780204681009-Banner1-con_texto.png', 'uploads/flyers/1780204681057-Banner2-con_texto.png'),
(12, 'uploads/flyers/1780205772264-Banner4-PC-con_texto.png', 'uploads/flyers/1780205772264-Banner4-PC-con_texto.png', 'uploads/flyers/1780205772292-Banner4-Mobile-con_texto.png'),
(13, 'uploads/flyers/1780205271354-Banner2-PC-con_texto.png', 'uploads/flyers/1780205271354-Banner2-PC-con_texto.png', 'uploads/flyers/1780205271402-Banner2-PC-con_texto-Mobile.png'),
(14, 'uploads/flyers/1780205510343-Banner3-PC-con_texto.png', 'uploads/flyers/1780205510343-Banner3-PC-con_texto.png', 'uploads/flyers/1780205510389-Banner3-Mobile-con_texto.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos_musculares`
--

CREATE TABLE `grupos_musculares` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupos_musculares`
--

INSERT INTO `grupos_musculares` (`id`, `nombre`, `descripcion`, `orden`, `estado`, `created_at`) VALUES
(1, 'Pecho', '', 1, 'activo', '2026-05-31 15:17:28'),
(3, 'Espalda', '', 2, 'activo', '2026-05-31 16:36:18'),
(4, 'Piernas', '', 4, 'activo', '2026-05-31 20:53:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `whatsapp` varchar(50) NOT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `comprobante` varchar(255) DEFAULT NULL,
  `productos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`productos`)),
  `total` decimal(12,2) NOT NULL,
  `moneda` varchar(10) DEFAULT 'COP',
  `estado` varchar(30) DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `tallas` text DEFAULT NULL,
  `imagenes` text DEFAULT NULL,
  `usa_tallas` tinyint(4) DEFAULT 1,
  `tipo_talla` varchar(50) DEFAULT NULL,
  `usa_colores` tinyint(4) DEFAULT 1,
  `colores` text DEFAULT NULL,
  `tipo_producto` varchar(30) DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `video` varchar(255) DEFAULT NULL,
  `variantes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variantes`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `imagen`, `categoria_id`, `descripcion`, `marca`, `stock`, `sku`, `tallas`, `imagenes`, `usa_tallas`, `tipo_talla`, `usa_colores`, `colores`, `tipo_producto`, `created_at`, `video`, `variantes`) VALUES
(16, 'proteina1', 149.00, 'uploads/productos/1780199212044-proteina1.png', 7, 'primera proteina', 'Adidas', NULL, NULL, NULL, '[\"uploads/productos/1780199212044-proteina1.png\"]', 1, NULL, 1, NULL, 'normal', '2026-05-31 03:46:52', NULL, '[{\"tallas\":[],\"colores\":[],\"stock\":1}]'),
(17, 'proteina2', 149.00, 'uploads/productos/1780199254324-proteina2.png', 5, 'segunda proteina', 'Adidas', NULL, NULL, NULL, '[\"uploads/productos/1780199254324-proteina2.png\"]', 1, NULL, 1, NULL, 'normal', '2026-05-31 03:47:34', NULL, '[{\"tallas\":[],\"colores\":[],\"stock\":2}]'),
(18, 'proteina3', 149.00, 'uploads/productos/1780199295584-proteina3.png', 7, 'tercera proteina', 'Adidas', NULL, NULL, NULL, '[\"uploads/productos/1780199295584-proteina3.png\"]', 1, NULL, 1, NULL, 'normal', '2026-05-31 03:48:15', NULL, '[{\"tallas\":[],\"colores\":[],\"stock\":3}]'),
(19, 'proteina4', 149.00, 'uploads/productos/1780199331235-proteina4.webp', 7, 'Cuarta Proteína', 'Adidas', NULL, NULL, NULL, '[\"uploads/productos/1780199331235-proteina4.webp\"]', 1, NULL, 1, NULL, 'normal', '2026-05-31 03:48:51', NULL, '[{\"tallas\":[],\"colores\":[],\"stock\":4}]'),
(20, 'Guantes de box', 50.00, 'uploads/productos/1780490685823-guantes-de-box.jpg', 7, 'guantes de box', 'Everlast', NULL, NULL, NULL, '[\"uploads/productos/1780490685823-guantes-de-box.jpg\",\"uploads/productos/1780490686201-vendas.jpg\"]', 1, NULL, 1, NULL, 'normal', '2026-06-03 12:44:46', NULL, '[{\"tallas\":[\"M\"],\"colores\":[\"Negro\"],\"stock\":2}]'),
(21, 'Vendas', 20.00, 'uploads/productos/1780490909405-vendas.jpg', 7, 'venda profesional', 'Everlast', NULL, NULL, NULL, '[\"uploads/productos/1780490909405-vendas.jpg\"]', 1, NULL, 1, NULL, 'normal', '2026-06-03 12:48:29', NULL, '[{\"tallas\":[\"L\"],\"colores\":[\"Negro\",\"Rojo\"],\"stock\":5}]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicidad_eventos`
--

CREATE TABLE `publicidad_eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `tipo` enum('publicidad','evento','promocion') DEFAULT 'publicidad',
  `enlace` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(30) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `publicidad_eventos`
--

INSERT INTO `publicidad_eventos` (`id`, `titulo`, `descripcion`, `imagen`, `tipo`, `enlace`, `whatsapp`, `fecha_inicio`, `fecha_fin`, `estado`, `created_at`) VALUES
(1, 'Chivas', 'Gran paseo en ibague', 'uploads/publicidad/publicidad-1780540476245-522296555.jpg', 'publicidad', 'https://facebook.com', '3233404121', '2026-06-07', '2026-07-07', 'activo', '2026-06-04 02:34:36');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `comentarios_clientes`
--
ALTER TABLE `comentarios_clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`);

--
-- Indices de la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grupo_id` (`grupo_id`);

--
-- Indices de la tabla `flyers`
--
ALTER TABLE `flyers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `grupos_musculares`
--
ALTER TABLE `grupos_musculares`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `publicidad_eventos`
--
ALTER TABLE `publicidad_eventos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `comentarios_clientes`
--
ALTER TABLE `comentarios_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `flyers`
--
ALTER TABLE `flyers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `grupos_musculares`
--
ALTER TABLE `grupos_musculares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `publicidad_eventos`
--
ALTER TABLE `publicidad_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD CONSTRAINT `ejercicios_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos_musculares` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
