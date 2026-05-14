import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const portNumber = process.env.PORT || 3000;

// Middleware para archivos estáticos y EJS
app.use(express.static("public"));
app.set("view engine", "ejs");

// Rutas con Arrow Functions y Async/Await (Requisito estricto)
const getHome = async (req, res) => {
    res.render("index", { title: "Home" });
};

const getOrganizations = async (req, res) => {
    res.render("organizations", { title: "Organizations" });
};

const getProjects = async (req, res) => {
    res.render("projects", { title: "Service Projects" });
};

const getCategories = async (req, res) => {
    res.render("categories", { title: "Service Categories" });
};

// Definición de rutas
app.get("/", getHome);
app.get("/organizations", getOrganizations);
app.get("/projects", getProjects);
app.get("/categories", getCategories);

app.listen(portNumber, () => {
    console.log(`Server running at http://localhost:${portNumber}`);
});
