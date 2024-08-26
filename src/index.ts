import { Hono } from "hono";
import { cors } from "hono/cors";
import { purchases } from "./api/purchases";
import { listings } from "./api/listings";
import { items } from "./api/items";
import { data } from "./api/data";
import { search } from "./api/search";
import { settings } from "./api/settings";
import { user } from "./api/user";
import { exportData } from "./api/export";
import { subscribe } from "./api/subscribe";
import { contact } from "./api/contact";

const app = new Hono();

app.use(cors());

app.route("/api", purchases);
app.route("/api", listings);
app.route("/api", items);
app.route("/api", data);
app.route("/api", search);
app.route("/api", settings);
app.route("/api", user);
app.route("/api", exportData);
app.route("/api", subscribe);
app.route("/api", contact);

export default app;
