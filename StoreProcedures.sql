
---RegistrarUsuario
CREATE PROCEDURE spRegistrarUsuario
    @Nombre VARCHAR(100),
    @Apellidos VARCHAR(100),
    @Email VARCHAR(100),
    @PasswordPlain VARCHAR(MAX),
    @RolID INT
AS
BEGIN
    INSERT INTO Usuarios (Nombre, Apellidos, Email, Password, RolID)
    VALUES (@Nombre, @Apellidos, @Email, HASHBYTES('SHA2_512', @PasswordPlain), @RolID);
END;





