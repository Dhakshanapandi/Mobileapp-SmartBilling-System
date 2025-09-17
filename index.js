import { Buffer } from "buffer";
import { registerRootComponent } from "expo";
import App from "./app/(tabs)/index";
global.Buffer = Buffer; // 🔥 Fixes call stack / Base64 issues

registerRootComponent(App);
