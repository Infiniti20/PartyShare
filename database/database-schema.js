db.prepare("CREATE TABLE users (userId varchar(25) PRIMARY KEY, user varchar(255), password varchar(255), profile varchar(55))").run()

db.prepare("CREATE TABLE products (userId varchar(25), profile varchar(55), user varchar(255), uuid varchar(25) PRIMARY KEY, image varchar(55), name varchar(255), desc varchar(1012), quantity int, category varchar(50), cost varchar(8), returned int)").run()


//Reviews are on Google Firebase

let uuid=utils.generateUUID()
db.prepare("INSERT INTO users VALUES(?,'John Doe',?, null)").run(uuid,utils.computeHash("password"))
db.prepare("INSERT INTO products VALUES(?,null,'John Doe', ?, null, 'White Vase', 'A beautiful white vase, with a leaf design, and gleaming white flowers.',3, '13.99', null )").run(uuid, utils.generateUUID())