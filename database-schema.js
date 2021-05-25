db.prepare("CREATE TABLE users (userId int PRIMARY KEY, user varchar(255), password varchar(255), profile BLOB(21845))").run()

db.prepare("CREATE TABLE products (userId int, username varchar(255), uuid varchar(50) PRIMARY KEY, image BLOB(21845), name varchar(255), desc varchar(1012), quantity int,  cost int, rented int, returned int)").run()