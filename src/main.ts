import { mount } from "svelte";
import App from "./lib/components/App.svelte";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";
import "./styles/base.css";

const target = document.getElementById("app");
if (!target) throw new Error("Mount target #app nicht gefunden");

export default mount(App, { target });
