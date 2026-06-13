// leaflet.heat is a UMD plugin that reads the global `L`.
// Import this module BEFORE leaflet.heat so window.L is set when the plugin initializes.
import L from "leaflet";
(window as unknown as { L: typeof L }).L = L;
