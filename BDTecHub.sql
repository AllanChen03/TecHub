-- Crear base de datos
CREATE DATABASE TecHub;
USE TecHub;

-- Roles
CREATE TABLE Roles (
    RolID INT AUTO_INCREMENT PRIMARY KEY,
    NombreRol VARCHAR(20) NOT NULL
);

-- Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password_hash varchar(255) NOT NULL,
    RolID INT,
    FOREIGN KEY (RolID) REFERENCES Roles(RolID)
);

-- Categorias
CREATE TABLE Categorias (
    CategoriaID INT AUTO_INCREMENT PRIMARY KEY,
    NombreCategoria VARCHAR(100) NOT NULL,
    ImagenPath VARCHAR(255)
);

-- Sedes
CREATE TABLE Sedes (
    SedeID INT AUTO_INCREMENT PRIMARY KEY,
    NombreSede VARCHAR(100) NOT NULL
);

-- Condicion del producto
CREATE TABLE CondicionProducto (
    CondicionID INT AUTO_INCREMENT PRIMARY KEY,
    EstadoProducto VARCHAR(20) NOT NULL
);

-- Disponibilidad del producto
CREATE TABLE DisponibilidadProducto (
    DisponibilidadID INT AUTO_INCREMENT PRIMARY KEY,
    NombreDisponibilidad VARCHAR(20) NOT NULL
);

-- Estado de orden
CREATE TABLE EstadoOrden (
    EstadoID INT AUTO_INCREMENT PRIMARY KEY,
    NombreEstado VARCHAR(20) NOT NULL
);

-- Productos
CREATE TABLE Productos (
    ProductoID INT AUTO_INCREMENT PRIMARY KEY,
    NombreProducto VARCHAR(100) NOT NULL,
    DescripcionProducto NVARCHAR(500),
    Precio DECIMAL(10,2),
    ImagenPath VARCHAR(255),
    CategoriaID INT,
    UsuarioID INT,
    SedeID INT,
    CondicionID INT,
    DisponibilidadID INT,
    FOREIGN KEY (CategoriaID) REFERENCES Categorias(CategoriaID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (SedeID) REFERENCES Sedes(SedeID),
    FOREIGN KEY (CondicionID) REFERENCES CondicionProducto(CondicionID),
    FOREIGN KEY (DisponibilidadID) REFERENCES DisponibilidadProducto(DisponibilidadID)
);

-- Ordenes
CREATE TABLE Ordenes (
    OrdenID INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PrecioTotal DECIMAL(10,2),
    UsuarioID INT,
    ProductoID INT,
    EstadoID INT,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID),
    FOREIGN KEY (EstadoID) REFERENCES EstadoOrden(EstadoID)
);

-- Comentarios
CREATE TABLE Comentarios (
    ComentarioID INT AUTO_INCREMENT PRIMARY KEY,
    Comentario NVARCHAR(500),
    CompradorID INT,
    VendedorID INT,
    ProductoID INT,
    FOREIGN KEY (CompradorID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (VendedorID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);

-- Inserts
INSERT INTO Roles (NombreRol) VALUES 
('Admin'), 
('Estudiante');

INSERT INTO Sedes (NombreSede) VALUES 
('Sede Central Cartago'), 
('Centro Académico de San José'), 
('Centro Académico de Alajuela'), 
('Centro Académico de Limón'), 
('Sede Regional San Carlos');

INSERT INTO CondicionProducto (EstadoProducto) VALUES 
('Nuevo'), 
('Usado'), 
('Mal Estado');

INSERT INTO DisponibilidadProducto (NombreDisponibilidad) VALUES 
('Disponible'), 
('Vendido'), 
('Reservado');

INSERT INTO EstadoOrden (NombreEstado) VALUES 
('Pendiente'), 
('Completado'), 
('Cancelado');

INSERT INTO Categorias (NombreCategoria) VALUES 
('Libros'), 
('Electronica'), 
('Laboratorio'), 
('Dibujo');