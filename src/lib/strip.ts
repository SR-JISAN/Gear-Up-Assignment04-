import Strip from "stripe";
import config from "../config";

export const strip = new Strip(config.strip_secret_key);