"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const mongodb_connection_string_url_1 = __importDefault(require("mongodb-connection-string-url"));
const port = '27017';
const connectionString = new mongodb_connection_string_url_1.default(`mongodb://localhost:${port}`);
connectionString.searchParams.set('authMechanism', 'MONGODB-OIDC');
exports.default = {
    dockerCompose: {
        projectName: path_1.default.basename(__dirname),
        yamlPath: path_1.default.resolve(__dirname, 'docker-compose.yaml'),
    },
    waitOn: [`tcp:${port}`],
    connections: {
        oidc: {
            connectionString: connectionString.href,
        },
    },
};
