import { mount } from "svelte";
import App from "./lib/components/App.svelte";
import "./styles/base.css";

const target = document.getElementById("app");
if (!target) throw new Error("Mount target #app nicht gefunden");

export default mount(App, { target });
