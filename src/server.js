const app = require('./app');
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend sur http://localhost:${PORT}`);
});
