
-- Creation of permissions table
CREATE TABLE permissions(
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description varchar(255) NOT NULL
);

-- Creation of roles table
CREATE TABLE  roles(
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description varchar(255) NOT NULL
);

-- Creation of users table
CREATE TABLE users(
  id serial PRIMARY KEY,
  username varchar(255) NOT NULL ,
  password varchar(255) NOT NULL,
  email varchar(255) NOT NULL
);


-- Creation of permissions_roles  many-to-many  table
CREATE TABLE roles_permissions(
  role_id integer NOT NULL,
  permission_id integer NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creation of roles table
CREATE TABLE users_roles(
  user_id integer NOT NULL,
  role_id integer NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE ,
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE
);


