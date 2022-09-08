const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const Contenedor = require('./container/container');
const PORT = 8080;

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: { origin: '*' },
});

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(__dirname + '/public'));

app.set('view engine', 'hbs');
app.set('views', './views');
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  })
);

const productsContainer = new Contenedor('products');
const chatList = new Contenedor('chat');

app.get('/', (req, res) => {
  res.render('productslist', { root: __dirname + '/public' });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(id);
  let productFound = productsContainer.getById(id).then((product) => {
    if (product) {
      res.render('product', { product });
    } else {
      res.render('errorTemplate', { errorMessage: `Producto de id ${id} no encontrado` });
    }
  });
});

let chat = [];

io.on('connection', (socket) => {
  console.log('Usuario Conectado ' + socket.id);
  // socket.emit('products', productsHC);
  productsContainer.getAll().then((products) => {
    socket.emit('products', products);
  });

  let products;
  productsContainer.getAll().then((products) => {
    products = products;
    socket.emit('products', products);
  });

  chatList
    .getAll()
    .then((data) => {
      chat = [...data];
      socket.emit('chat', chat);
    })
    .catch((err) => {
      socket.emit('chat', chat);
    });

  socket.on('newMessage', (msg) => {
    chat.push(msg);
    chatList.save(msg);
    try {
      io.sockets.emit('chat', chat);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('addProduct', (product) => {
    products.push(product);
    productsContainer.save(product).then((data) => {
      console.log(data);
      io.sockets.emit('products', products);
    });
  });
});

httpServer.listen(process.env.PORT || 8080, () => console.log('SERVER ON'));
