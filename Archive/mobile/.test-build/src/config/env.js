"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const expo_constants_1 = __importDefault(require("expo-constants"));
const extra = (expo_constants_1.default.expoConfig?.extra ?? {});
exports.config = {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? 'http://localhost:8000',
    developmentToken: process.env.EXPO_PUBLIC_SANCTUM_TOKEN ?? extra.developmentToken ?? ''
};
