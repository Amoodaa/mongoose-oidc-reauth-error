"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
exports.OIDCMockProvider = void 0;
var events_1 = require("events");
var http_1 = require("http");
var crypto = require("crypto");
var util_1 = require("util");
var url_1 = require("url");
function randomString(n, enc) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, util_1.promisify)(crypto.randomBytes)(n)];
                case 1: return [2 /*return*/, (_a.sent()).toString(enc)];
            }
        });
    });
}
function toJSONtoUTF8toBase64Url(obj) {
    return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}
/**
 * A mock OIDC authorization server (AS) implementation.
 *
 * This mock will happily give out valid tokens with arbitrary contents, so
 * it is absolutely unusable for usage outside of testing!
 */
var OIDCMockProvider = /** @class */ (function () {
    function OIDCMockProvider(config) {
        var _this = this;
        var _a;
        this.state = new Map();
        this.httpServer = ((_a = config.createHTTPServer) !== null && _a !== void 0 ? _a : http_1.createServer)(function (req, res) { return void _this.handleRequest(req, res); });
        this.config = config;
        // Initialized in .init().
        this.issuer = '';
        this.kid = '';
        this.keys = {};
    }
    OIDCMockProvider.prototype.init = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var port, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.httpServer.listen((_a = this.config.port) !== null && _a !== void 0 ? _a : 0, this.config.bindIpAll ? '::' : this.config.hostname);
                        return [4 /*yield*/, (0, events_1.once)(this.httpServer, 'listening')];
                    case 1:
                        _e.sent();
                        port = this.httpServer.address().port;
                        this.issuer = "".concat('setSecureContext' in this.httpServer ? 'https' : 'http', "://").concat((_b = this.config.hostname) !== null && _b !== void 0 ? _b : 'localhost', ":").concat(port);
                        _c = this;
                        return [4 /*yield*/, randomString(8, 'hex')];
                    case 2:
                        _c.kid = _e.sent();
                        _d = this;
                        return [4 /*yield*/, (0, util_1.promisify)(crypto.generateKeyPair)('rsa', {
                                modulusLength: 2048
                            })];
                    case 3:
                        _d.keys = _e.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    OIDCMockProvider.create = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new this(config).init()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    OIDCMockProvider.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.httpServer.close();
                        return [4 /*yield*/, (0, events_1.once)(this.httpServer, 'close')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OIDCMockProvider.prototype.handleRequest = function (req, res) {
        var _a, e_1, _b, _c;
        var _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var url, body, _j, _k, _l, chunk, e_1_1, parsed, result, _m, _o, client_id, scope, response_type, redirect_uri, code_challenge, code_challenge_method, state, nonce, redirectTo, _p, _q, _r, code, code_verifier, device_code, _s, client_id, scope, code_challenge, code_challenge_method, isDeviceCode, nonce, expectedChallenge, actualChallenge, _t, access_token, id_token, expires_in, _u, client_id, scope, device_code, err_1;
            var _v, _w, _x;
            return __generator(this, function (_y) {
                switch (_y.label) {
                    case 0:
                        res.setHeader('Content-Type', 'application/json');
                        _y.label = 1;
                    case 1:
                        _y.trys.push([1, 29, , 30]);
                        url = new URL(req.url || '/', this.issuer);
                        if (!(req.method === 'POST')) return [3 /*break*/, 14];
                        // For simplicity, just merge POST parameters with GET parameters...
                        if (
                        // ONLY CHANGE IN THIS FILE FROM THE OG published package
                        // req.headers['content-type'] !== 'application/x-www-form-urlencoded'
                        !((_d = req.headers['content-type']) === null || _d === void 0 ? void 0 : _d.includes('application/x-www-form-urlencoded'))) {
                            throw new Error('Only accepting application/x-www-form-urlencoded POST bodies');
                        }
                        body = '';
                        _y.label = 2;
                    case 2:
                        _y.trys.push([2, 7, 8, 13]);
                        _j = true, _k = __asyncValues(req.setEncoding('utf8'));
                        _y.label = 3;
                    case 3: return [4 /*yield*/, _k.next()];
                    case 4:
                        if (!(_l = _y.sent(), _a = _l.done, !_a)) return [3 /*break*/, 6];
                        _c = _l.value;
                        _j = false;
                        try {
                            chunk = _c;
                            body += chunk;
                        }
                        finally {
                            _j = true;
                        }
                        _y.label = 5;
                    case 5: return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _y.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _y.trys.push([8, , 11, 12]);
                        if (!(!_j && !_a && (_b = _k["return"]))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _b.call(_k)];
                    case 9:
                        _y.sent();
                        _y.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        parsed = new url_1.URLSearchParams(body);
                        url.search = new url_1.URLSearchParams(__assign(__assign({}, Object.fromEntries(url.searchParams)), Object.fromEntries(parsed))).toString();
                        _y.label = 14;
                    case 14:
                        result = void 0;
                        return [4 /*yield*/, ((_f = (_e = this.config).overrideRequestHandler) === null || _f === void 0 ? void 0 : _f.call(_e, url.toString(), req, res))];
                    case 15:
                        _y.sent();
                        if (res.writableEnded)
                            return [2 /*return*/];
                        _m = url.pathname;
                        switch (_m) {
                            case '/.well-known/openid-configuration': return [3 /*break*/, 16];
                            case '/jwks': return [3 /*break*/, 17];
                            case '/authorize': return [3 /*break*/, 18];
                            case '/token': return [3 /*break*/, 20];
                            case '/device': return [3 /*break*/, 23];
                            case '/verify-device': return [3 /*break*/, 26];
                        }
                        return [3 /*break*/, 27];
                    case 16:
                        result = __assign({ issuer: this.issuer, token_endpoint: new URL('/token', this.issuer).toString(), authorization_endpoint: new URL('/authorize', this.issuer).toString(), jwks_uri: new URL('/jwks', this.issuer).toString(), device_authorization_endpoint: new URL('/device', this.issuer).toString() }, (_h = (_g = this.config).additionalIssuerMetadata) === null || _h === void 0 ? void 0 : _h.call(_g));
                        return [3 /*break*/, 28];
                    case 17:
                        // Provide this server's public key in JWK format
                        result = {
                            keys: [
                                __assign({ alg: 'RS256', kid: this.kid }, this.keys.publicKey["export"]({ format: 'jwk' })),
                            ]
                        };
                        return [3 /*break*/, 28];
                    case 18:
                        _o = Object.fromEntries(url.searchParams), client_id = _o.client_id, scope = _o.scope, response_type = _o.response_type, redirect_uri = _o.redirect_uri, code_challenge = _o.code_challenge, code_challenge_method = _o.code_challenge_method, state = _o.state, nonce = _o.nonce;
                        if (response_type !== 'code') {
                            throw new Error("unknown response_type ".concat(response_type));
                        }
                        redirectTo = new URL(redirect_uri);
                        _p = redirectTo;
                        _q = url_1.URLSearchParams.bind;
                        _v = {};
                        return [4 /*yield*/, this.storeForSingleRetrieval({
                                client_id: client_id,
                                scope: scope,
                                code_challenge: code_challenge,
                                code_challenge_method: code_challenge_method,
                                nonce: nonce
                            })];
                    case 19:
                        _p.search = new (_q.apply(url_1.URLSearchParams, [void 0, (_v.code = _y.sent(),
                                _v.state = state,
                                _v)]))().toString();
                        res.statusCode = 307;
                        res.setHeader('Location', redirectTo.toString());
                        res.end("Moved to ".concat(redirectTo.toString()));
                        return [3 /*break*/, 28];
                    case 20:
                        _r = Object.fromEntries(url.searchParams), code = _r.code, code_verifier = _r.code_verifier, device_code = _r.device_code;
                        _s = this.retrieveFromStorage(device_code !== null && device_code !== void 0 ? device_code : code), client_id = _s.client_id, scope = _s.scope, code_challenge = _s.code_challenge, code_challenge_method = _s.code_challenge_method, isDeviceCode = _s.isDeviceCode, nonce = _s.nonce;
                        if (!isDeviceCode) {
                            // Verify the code challenge. Not strictly necessary here since
                            // we assume the OIDC implementation we are using to be correct
                            // and this server is test-only, but also not a lot of extra work
                            // to add this.
                            if (code_challenge_method !== 'S256') {
                                throw new Error("Unsupported code challenge method ".concat(String(code_challenge_method)));
                            }
                            expectedChallenge = crypto
                                .createHash('sha256')
                                .update(code_verifier)
                                .digest('hex');
                            actualChallenge = Buffer.from(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            code_challenge, 'base64').toString('hex');
                            if (expectedChallenge !== actualChallenge) {
                                throw new Error('Challenge mismatch');
                            }
                        }
                        return [4 /*yield*/, this.issueToken({
                                client_id: client_id,
                                scope: scope,
                                nonce: nonce
                            })];
                    case 21:
                        _t = _y.sent(), access_token = _t.access_token, id_token = _t.id_token, expires_in = _t.expires_in;
                        _w = {
                            access_token: access_token,
                            id_token: id_token
                        };
                        return [4 /*yield*/, this.storeForSingleRetrieval({
                                id_token: id_token,
                                access_token: access_token
                            })];
                    case 22:
                        // Issue a token response:
                        result = (_w.refresh_token = _y.sent(),
                            _w.token_type = 'Bearer',
                            _w.expires_in = expires_in,
                            _w);
                        return [3 /*break*/, 28];
                    case 23:
                        _u = Object.fromEntries(url.searchParams), client_id = _u.client_id, scope = _u.scope;
                        return [4 /*yield*/, this.storeForSingleRetrieval({
                                client_id: client_id,
                                scope: scope,
                                isDeviceCode: true
                            })];
                    case 24:
                        device_code = _y.sent();
                        _x = {
                            device_code: device_code
                        };
                        return [4 /*yield*/, randomString(8, 'hex')];
                    case 25:
                        result = (_x.user_code = _y.sent(),
                            _x.verification_uri = new URL('/verify-device', this.issuer).toString(),
                            _x.expires_in = 3600,
                            _x.interval = 1,
                            _x);
                        return [3 /*break*/, 28];
                    case 26:
                        // The Device Auth Flow requires a URL to point users at.
                        // We can just use this as a dummy endpoint.
                        res.statusCode = 200;
                        result = { status: 'Verified!' };
                        return [3 /*break*/, 28];
                    case 27:
                        res.statusCode = 404;
                        result = { error: 'not found:' + url.pathname };
                        return [3 /*break*/, 28];
                    case 28:
                        res.end(JSON.stringify(result));
                        return [3 /*break*/, 30];
                    case 29:
                        err_1 = _y.sent();
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            error: typeof err_1 === 'object' && err_1 && 'message' in err_1
                                ? err_1.message
                                : String(err_1)
                        }));
                        return [3 /*break*/, 30];
                    case 30: return [2 /*return*/];
                }
            });
        });
    };
    OIDCMockProvider.prototype.issueToken = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, expires_in, payload, skipIdToken, customIdTokenPayload, currentTimeInSeconds, header, fullPayload, makeToken;
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.config.getTokenPayload(metadata)];
                    case 1:
                        _a = _c.sent(), expires_in = _a.expires_in, payload = _a.payload, skipIdToken = _a.skipIdToken, customIdTokenPayload = _a.customIdTokenPayload;
                        currentTimeInSeconds = Math.floor(Date.now() / 1000);
                        header = {
                            alg: 'RS256',
                            typ: 'JWT',
                            kid: this.kid
                        };
                        _b = {};
                        return [4 /*yield*/, randomString(8, 'hex')];
                    case 2:
                        fullPayload = __assign.apply(void 0, [(_b.jti = _c.sent(), _b.iat = currentTimeInSeconds, _b.exp = currentTimeInSeconds + expires_in, _b.client_id = metadata.client_id, _b.scope = metadata.scope, _b.iss = this.issuer, _b.aud = metadata.client_id, _b.nonce = metadata.nonce, _b), payload]);
                        makeToken = function (payload) {
                            var signedMaterial = toJSONtoUTF8toBase64Url(header) +
                                '.' +
                                toJSONtoUTF8toBase64Url(payload);
                            var signature = crypto
                                .createSign('RSA-SHA256')
                                .update(signedMaterial)
                                .sign(_this.keys.privateKey, 'base64url');
                            return "".concat(signedMaterial, ".").concat(signature);
                        };
                        return [2 /*return*/, {
                                expires_in: expires_in,
                                access_token: makeToken(fullPayload),
                                // In an ID Token, aud === client_id, in an Access Token, not necessarily
                                id_token: skipIdToken
                                    ? undefined
                                    : makeToken(__assign(__assign(__assign({}, fullPayload), { aud: metadata.client_id }), customIdTokenPayload))
                            }];
                }
            });
        });
    };
    // Store a value for later re-use in another HTTP request/response pair.
    OIDCMockProvider.prototype.storeForSingleRetrieval = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, randomString(12, 'base64')];
                    case 1:
                        id = _a.sent();
                        this.state.set(id, payload);
                        return [2 /*return*/, id];
                }
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OIDCMockProvider.prototype.retrieveFromStorage = function (id) {
        var entry = this.state.get(id);
        this.state["delete"](id);
        return entry;
    };
    return OIDCMockProvider;
}());
exports.OIDCMockProvider = OIDCMockProvider;
