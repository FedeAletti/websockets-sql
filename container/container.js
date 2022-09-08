const { options } = require('./mariaDB');

const knexProducts = require('knex')(options);
const knexChat = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/mydb.sqlite',
  },
  useNullAsDefault: true,
});

class Contenedor {
  constructor(nombreArchivo) {
    this.nombreArchivo = nombreArchivo;
  }

  async getData() {
    try {
      let knex = this.nombreArchivo.includes('products') ? knexProducts : knexChat;
      knex.schema.hasTable(this.nombreArchivo).then((exists) => {
        if (exists) {
          knex
            .select('*')
            .from(this.nombreArchivo)
            .then((rows) => {
              if (this.nombreArchivo.includes('products')) {
                rows = rows.map((row) => {
                  return {
                    id_product: row.id_product,
                    name: row.name,
                    price: row.price,
                    stock: row.stock,
                    code: row.code,
                    description: row.description,
                    thumbnail: row.thumbnail,
                  };
                });
              } else {
                rows = rows.map((row) => {
                  return {
                    id_chat: row.id_chat,
                    user: row.user,
                    user_email: row.user_email,
                    message: row.message,
                    date: row.date,
                  };
                });
                return rows;
              }
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              knex.destroy();
            });
        } else {
          if (this.nombreArchivo.includes('products')) {
            knex.schema.createTable(this.nombreArchivo, (table) => {
              table.increments('id_product');
              table.string('name');
              table.integer('price');
              table.integer('stock');
              table.string('code');
              table.string('description');
              table.string('thumbnail');
            });
          } else {
            knex.schema
              .createTable('chat', (table) => {
                table.increments('id_chat').primary();
                table.string('email');
                table.string('message');
                table.string('date');
              })
              .then(() => {
                console.log('Table created');
              })
              .catch((err) => {
                console.log(err);
              })
              .finally(() => {
                knex.destroy();
              });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getAll() {
    const data = await this.getData();
    return data;
  }

  async save(obj) {
    try {
      // save in table
      let knex = this.nombreArchivo.includes('products') ? knexProducts : knexChat;

      knex(this.nombreArchivo)
        .insert(obj)
        .then((res) => {
          return 'Guardado correctamente';
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          knex.destroy();
        });
    } catch (err) {
      console.log(err);
    }
  }

  async getById(id) {
    try {
      let knex = this.nombreArchivo.includes('products') ? knexProducts : knexChat;

      knex
        .from('products')
        .select('*')
        .where('id_product', id)
        .then((data) => {
          if (data.length > 0) {
            data = data.map((row) => {
              return {
                id_product: row.id_product,
                name: row.name,
                price: row.price,
                stock: row.stock,
                code: row.code,
                description: row.description,
                thumbnail: row.thumbnail,
              };
            });
            return data;
          } else {
            return null;
          }
        })
        .catch((err) => {
          console.log(err);
          return null;
        })
        .finally(() => {
          knex.destroy();
        });
    } catch {
      return null;
    }
  }

  async deleteById(id) {
    try {
      let knex = this.nombreArchivo.includes('products') ? knexProducts : knexChat;

      knex
        .from('products')
        .where('id_product', 1)
        .del()
        .then((res) => {
          return 'Eliminado correctamente';
        })
        .catch((err) => {
          console.log(err);
          return;
        })
        .finally(() => {
          knex.destroy();
        });
    } catch {
      return null;
    }
  }

  async deleteAll() {
    try {
      let knex = this.nombreArchivo.includes('products') ? knexProducts : knexChat;
      console.log(this.nombreArchivo);
      knex
        .from('products')
        .del()
        .then((res) => {
          return 'Eliminado correctamente';
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          knex.destroy();
        });
    } catch (err) {
      return null;
    }
  }
}

module.exports = Contenedor;
