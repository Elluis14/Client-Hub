import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const portNumber = process.env.PORT || 3000;

// Configuración de archivos estáticos y motor de vistas
app.use(express.static('public'));
app.set('view engine', 'ejs');

/**
 * Routes
 */

// Ruta de Inicio (Home)
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('index', { title }); // Asegúrate de que el archivo sea index.ejs
});

// Ruta de Organizaciones
app.get('/organizations', async (req, res) => {
    const title = 'Our Partner Organizations';
    res.render('organizations', { title });
});

// Ruta de Proyectos
app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    res.render('projects', { title });
});

// Ruta de Categorías (Añadida para completar las 4 requeridas)
app.get('/categories', async (req, res) => {
    const title = 'Service Categories';
    res.render('categories', { title });
});

// Encendido del servidor
app.listen(portNumber, () => {
    console.log(`Server running at http://localhost:${portNumber}`);
});