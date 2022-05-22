-- SQLite
CREATE TABLE subimages (imageURL varchar(55), productId varchar(25), FOREIGN KEY(productId) REFERENCES products(id))