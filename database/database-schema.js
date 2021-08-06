`USERS TABLE`
 userId, varchar(25), UUID from utility functions
 user, varchar(100), username for user
 password, varchar(255), SHA256 hash 
 email, varchar(90), email for inquiries
 phone, varchar(18), phone number for contacting

`PRODUCTS TABLE`
 userId, varchar(25), foreign key for finding products by user
 user, varchar(100), username
 email, varchar(90), email for inquiries
 uuid, varchar(25), UUID from utility functions
 image, varchar(55), image url for diplaying
 name, varchar(90), title of products
 desc, varchar(512), description of products,
 info, varchar(512), info about product
 quantity, int, number of products
 category, varchar(50), catgeory for ordering products,
 cost, varchar(8), string for storing product price per day
 deposit, varchar(8), deposit amount for product
 returned, int, number of days until return. null if not rented

[
  'userId',   'user',
  'email',    'uuid',
  'image',    'name',
  'desc',     'quantity',
  'category', 'cost',
  'returned', 'info',
  'deposit'
]

//Table Creation
db.prepare(`CREATE TABLE users (
	userId varchar(25) PRIMARY KEY,
	user varchar(100),
	password varchar(25),
	email varchar(90),
	phone varchar(18)
)`).run()

db.prepare(`CREATE TABLE products (
	userId varchar(25),
	user varchar(100),
	email varchar(90),
	uuid varchar(25),
	image varchar(55),
	name varchar(90),
	desc varchar(400),
	quantity int,
	category varchar(50),
	cost varchar(8),
	returned int
)`).run()

//Placeholder DB Entries
let userUUID=utils.generateUUID()
let pass=utils.computeHash("password")

db.prepare(`INSERT INTO users VALUES(
	?,
	'John Doe',
	?,
	'john@doe.com'
)`).run(userUUID,pass)

db.prepare(`INSERT INTO products VALUES(
	?,
	'John Doe',
	'john@doe.com',
	?,
	?,
	'Placeholder',
	'Some placeholder data, from the schema.',
	6,
	'Formal',
	'16.99',
	null
)`)