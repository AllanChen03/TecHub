CREATE DATABASE TecHub;
GO
USE TecHuB;
go

--- Roles (Admin, UsuarioGeneral)
CREATE TABLE Roles (
	RolID int primary key identity (1,1),
	NombreRol Varchar(20) not null
);


--- Usuarios
CREATE TABLE Usuarios(
	UsuarioID int primary key identity (1,1),
	Nombre VARCHAR(100) not null,
	Apellidos Varchar(100) not null,
	Email VARCHAR(100) unique not null,
	Password VarBinary(64) not null,
	RolID int foreign key references Roles(RolID)
);


--- Categorias de los productos
CREATE TABLE Categorias(
	CategoriaID int primary key identity (1,1),
	NombreCategoria Varchar(100) not null
);

--- Sedes del Tec (San Jose, Cartago, Alajuela, Limon, San Carlos)
CREATE TABLE Sedes(
	SedeID int primary key identity (1,1),
	NombreSede varchar(100) not null
);


--- Condicion del producto (Nuevo, Usado)
CREATE TABLE CondicionProducto(
	CondicionID int primary key identity (1,1),
	EstadoProducto varchar(20) not null
);

--- Disponibilidad del producto (Disponible, Vendido, Reservado)
CREATE TABLE DisponibilidadProducto(
	DisponibilidadID int primary key identity (1,1),
	NombreDisponibilidad varchar(20) not null
);

---Estado en el que se encuentra la orden (Pendiente, Completado)
CREATE TABLE EstadoOrden(
	EstadoID int primary key identity (1,1),
	NombreEstado varchar(20) not null
);


--- Productos (Nombre, Descripcion, Categoria, Precio, Imagen, Ubicacion, Condicion, Disponibilidad)
CREATE TABLE Productos(
	ProductoID int primary key identity (1,1),
	NombreProducto varchar(100) not null,
	DescripcionProducto nvarchar(500),
	Precio decimal(10,2),
	ImagePath varchar(255),
	CategoriaID int foreign key references Categorias(CategoriaID),
	UsuarioID int foreign key references Usuarios(UsuarioID),
	SedeID int foreign key references Sedes(SedeID),
	CondicionID int foreign key references CondicionProducto(CondicionID),
	DisponibilidadID int foreign key references DisponibilidadProducto(DisponibilidadID)
);

--- Ordenes (Fecha, Precio, Producto, usuario y estado)
CREATE TABLE Ordenes(
	OrdenID int primary key identity (1,1),
	Fecha Datetime default getdate(),
	PrecioTotal decimal(10,2),
	UsuarioID int foreign key references Usuarios(UsuarioID),
	ProductoID int foreign key references Productos(ProductoID),
	EstadoID int foreign key references EstadoOrden(EstadoID)
	
);

--- Comentarios sobre el vendedor
CREATE TABLE Comentarios(
	ComentarioID int primary key identity (1,1),
	Comentario nvarchar(500),
	CompradorID int foreign key references Usuarios(UsuarioID),
	VendedorID int foreign key references Usuarios(UsuarioID),
	ProductoID int foreign key references Productos(ProductoID)
);


---Inserts Predeterminados

INSERT INTO Roles VALUES ('Admin'), ('Estudiante');
INSERT INTO Sedes VALUES ('Sede Central Cartago'), ('Centro Académico de San José'), ('Centro Académico de Alajuela'), ('Centro Académico de Limón'), ('Sede Regional San Carlos');
INSERT INTO CondicionProducto VALUES ('Nuevo'), ('Usado'), ('Mal Estado');
INSERT INTO DisponibilidadProducto VALUES ('Disponible'), ('Vendido'), ('Reservado');
INSERT INTO EstadoOrden VALUES ('Pendiente'), ('Completado'), ('Cancelado');
INSERT INTO Categorias VALUES ('Libros'), ('Electronica'), ('Laboratorio'), ('Dibujo');