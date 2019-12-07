"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var SQLConnection_1 = require("../backend/model/sql/SQLConnection");
var Config_1 = require("../common/config/private/Config");
var IPrivateConfig_1 = require("../common/config/private/IPrivateConfig");
var ObjectManagers_1 = require("../backend/model/ObjectManagers");
var DiskMangerWorker_1 = require("../backend/model/threading/DiskMangerWorker");
var IndexingManager_1 = require("../backend/model/sql/IndexingManager");
var SearchManager_1 = require("../backend/model/sql/SearchManager");
var fs = require("fs");
var AutoCompleteItem_1 = require("../common/entities/AutoCompleteItem");
var Utils_1 = require("../common/Utils");
var GalleryManager_1 = require("../backend/model/sql/GalleryManager");
var BMIndexingManager = /** @class */ (function (_super) {
    __extends(BMIndexingManager, _super);
    function BMIndexingManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BMIndexingManager.prototype.saveToDB = function (scannedDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _super.prototype.saveToDB.call(this, scannedDirectory)];
            });
        });
    };
    return BMIndexingManager;
}(IndexingManager_1.IndexingManager));
exports.BMIndexingManager = BMIndexingManager;
var Benchmarks = /** @class */ (function () {
    function Benchmarks(RUNS, dbPath) {
        var _this = this;
        this.RUNS = RUNS;
        this.dbPath = dbPath;
        this.resetDB = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLConnection_1.SQLConnection.close()];
                    case 1:
                        _a.sent();
                        if (fs.existsSync(this.dbPath)) {
                            fs.unlinkSync(this.dbPath);
                        }
                        Config_1.Config.Server.database.type = IPrivateConfig_1.DatabaseType.sqlite;
                        Config_1.Config.Server.database.sqlite.storage = this.dbPath;
                        return [4 /*yield*/, ObjectManagers_1.ObjectManagers.InitSQLManagers()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
    }
    Benchmarks.prototype.bmSaveDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dir, im;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.resetDB()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, DiskMangerWorker_1.DiskMangerWorker.scanDirectory('./')];
                    case 2:
                        dir = _a.sent();
                        im = new BMIndexingManager();
                        return [4 /*yield*/, this.benchmark(function () { return im.saveToDB(dir); }, function () { return _this.resetDB(); })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Benchmarks.prototype.bmScanDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.benchmark(function () { return DiskMangerWorker_1.DiskMangerWorker.scanDirectory('./'); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Benchmarks.prototype.bmListDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gm = new GalleryManager_1.GalleryManager();
                        return [4 /*yield*/, this.setupDB()];
                    case 1:
                        _a.sent();
                        Config_1.Config.Server.indexing.reIndexingSensitivity = IPrivateConfig_1.ReIndexingSensitivity.low;
                        return [4 /*yield*/, this.benchmark(function () { return gm.listDirectory('./'); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Benchmarks.prototype.bmAllSearch = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var types, results, sm, _loop_1, this_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupDB()];
                    case 1:
                        _a.sent();
                        types = Utils_1.Utils.enumToArray(AutoCompleteItem_1.SearchTypes).map(function (a) { return a.key; }).concat([null]);
                        results = [];
                        sm = new SearchManager_1.SearchManager();
                        _loop_1 = function (i) {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _b = (_a = results).push;
                                        _c = {};
                                        return [4 /*yield*/, this_1.benchmark(function () { return sm.search(text, types[i]); })];
                                    case 1:
                                        _b.apply(_a, [(_c.result = _d.sent(), _c.searchType = types[i], _c)]);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < types.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    Benchmarks.prototype.bmInstantSearch = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var sm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupDB()];
                    case 1:
                        _a.sent();
                        sm = new SearchManager_1.SearchManager();
                        return [4 /*yield*/, this.benchmark(function () { return sm.instantSearch(text); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Benchmarks.prototype.bmAutocomplete = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var sm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupDB()];
                    case 1:
                        _a.sent();
                        sm = new SearchManager_1.SearchManager();
                        return [4 /*yield*/, this.benchmark(function () { return sm.autocomplete(text); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Benchmarks.prototype.benchmark = function (fn, beforeEach, afterEach) {
        if (beforeEach === void 0) { beforeEach = null; }
        if (afterEach === void 0) { afterEach = null; }
        return __awaiter(this, void 0, void 0, function () {
            var scanned, start, skip, i, startSkip, endSkip, startSkip, endSkip, end, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fn()];
                    case 1:
                        scanned = _a.sent();
                        start = process.hrtime();
                        skip = 0;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.RUNS)) return [3 /*break*/, 8];
                        if (!beforeEach) return [3 /*break*/, 4];
                        startSkip = process.hrtime();
                        return [4 /*yield*/, beforeEach()];
                    case 3:
                        _a.sent();
                        endSkip = process.hrtime(startSkip);
                        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
                        _a.label = 4;
                    case 4: return [4 /*yield*/, fn()];
                    case 5:
                        _a.sent();
                        if (!afterEach) return [3 /*break*/, 7];
                        startSkip = process.hrtime();
                        return [4 /*yield*/, afterEach()];
                    case 6:
                        _a.sent();
                        endSkip = process.hrtime(startSkip);
                        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        end = process.hrtime(start);
                        duration = (end[0] * 1000 + end[1] / 1000000) / this.RUNS;
                        if (!scanned) {
                            return [2 /*return*/, {
                                    duration: duration
                                }];
                        }
                        if (Array.isArray(scanned)) {
                            return [2 /*return*/, {
                                    duration: duration,
                                    items: scanned.length
                                }];
                        }
                        return [2 /*return*/, {
                                duration: duration,
                                media: scanned.media.length,
                                directories: scanned.directories.length
                            }];
                }
            });
        });
    };
    Benchmarks.prototype.setupDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var im, dir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        im = new BMIndexingManager();
                        return [4 /*yield*/, this.resetDB()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, DiskMangerWorker_1.DiskMangerWorker.scanDirectory('./')];
                    case 2:
                        dir = _a.sent();
                        return [4 /*yield*/, im.saveToDB(dir)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Benchmarks;
}());
exports.Benchmarks = Benchmarks;
//# sourceMappingURL=Benchmarks.js.map