
-- FEEDING THE DATABASE WITH DATA
-- Path: postgres/auth_seed.sql
-- Compare this snippet from postgres/auth_tables.sql:
--  Insertion of permissions table
INSERT INTO
    permissions (name, description)
VALUES
    ('create', 'Creating something'),
    ('update', 'Updating someting'),
    ('delete', 'Deleting something'),
    ('read', 'Reading something'),
    ('admin', 'Administering something');

--  Insertion of roles table
INSERT INTO
    roles (name, description)
VALUES
    ('admin', 'Admin role'),
    ('user', 'User role');

-- Insertion of users table
INSERT INTO
    users (username, password, email)
VALUES
    (
        'admin',
        'admin',
        'admin@localhost'
    ),
    ('user', 'user', 'user@localhost');

-- Insertion of permissions_roles table
INSERT INTO
    roles_permissions (role_id, permission_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (2, 1),
    (2, 2),
    (2, 3),
    (2, 4);

-- Insertion of users_roles table
INSERT INTO
    users_roles (user_id, role_id)
VALUES
    (1, 1),
    (2, 2);
