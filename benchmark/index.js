"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = require("../common/config/private/Config");
var path = require("path");
var ProjectPath_1 = require("../backend/ProjectPath");
var Benchmarks_1 = require("./Benchmarks");
var AutoCompleteItem_1 = require("../common/entities/AutoCompleteItem");
var Utils_1 = require("../common/Utils");
var DiskMangerWorker_1 = require("../backend/model/threading/DiskMangerWorker");
var config = require(path.join(__dirname, 'config.json'));
Config_1.Config.Server.imagesFolder = config.path;
var dbPath = path.join(__dirname, 'test.db');
ProjectPath_1.ProjectPath.reset();
var RUNS = 50;
var resultsText = '';
var printLine = function (text) {
    resultsText += text + '\n';
};
var printHeader = function () { return __awaiter(_this, void 0, void 0, function () {
    var dt, dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dt = new Date();
                printLine('## PiGallery2 v' + require('./../package.json').version +
                    ', ' + Utils_1.Utils.zeroPrefix(dt.getDate(), 2) +
                    '.' + Utils_1.Utils.zeroPrefix(dt.getMonth() + 1, 2) +
                    '.' + dt.getFullYear());
                printLine('**System**: ' + config.system);
                return [4 /*yield*/, DiskMangerWorker_1.DiskMangerWorker.scanDirectory('./')];
            case 1:
                dir = _a.sent();
                printLine('**Gallery**: directories: ' +
                    dir.directories.length +
                    ' media: ' + dir.media.length +
                    // @ts-ignore
                    ', faces: ' + dir.media.reduce(function (p, c) { return p + (c.metadata.faces || []).length; }, 0));
                return [2 /*return*/];
        }
    });
}); };
var printTableHeader = function () {
    printLine('| action | action details | average time | details |');
    printLine('|:------:|:--------------:|:------------:|:-------:|');
};
var printResult = function (result, action, actionDetails) {
    if (actionDetails === void 0) { actionDetails = ''; }
    console.log('benchmarked: ' + action);
    var details = '-';
    if (result.items) {
        details = 'items: ' + result.items;
    }
    if (result.media) {
        details = 'media: ' + result.media + ', directories:' + result.directories;
    }
    printLine('| ' + action + ' | ' + actionDetails +
        ' | ' + (result.duration).toFixed(1) + 'ms | ' + details + ' |');
};
var run = function () { return __awaiter(_this, void 0, void 0, function () {
    var start, bm, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                start = Date.now();
                bm = new Benchmarks_1.Benchmarks(RUNS, dbPath);
                // header
                return [4 /*yield*/, printHeader()];
            case 1:
                // header
                _f.sent();
                printTableHeader();
                _a = printResult;
                return [4 /*yield*/, bm.bmScanDirectory()];
            case 2:
                _a.apply(void 0, [_f.sent(), 'Scanning directory']);
                _b = printResult;
                return [4 /*yield*/, bm.bmSaveDirectory()];
            case 3:
                _b.apply(void 0, [_f.sent(), 'Saving directory']);
                _c = printResult;
                return [4 /*yield*/, bm.bmListDirectory()];
            case 4:
                _c.apply(void 0, [_f.sent(), 'Listing Directory']);
                return [4 /*yield*/, bm.bmAllSearch('a')];
            case 5:
                (_f.sent()).forEach(function (res) {
                    if (res.searchType !== null) {
                        printResult(res.result, 'searching', '`a` as `' + AutoCompleteItem_1.SearchTypes[res.searchType] + '`');
                    }
                    else {
                        printResult(res.result, 'searching', '`a` as `any`');
                    }
                });
                _d = printResult;
                return [4 /*yield*/, bm.bmInstantSearch('a')];
            case 6:
                _d.apply(void 0, [_f.sent(), 'instant search', '`a`']);
                _e = printResult;
                return [4 /*yield*/, bm.bmAutocomplete('a')];
            case 7:
                _e.apply(void 0, [_f.sent(), 'auto complete', '`a`']);
                console.log(resultsText);
                console.log('run for : ' + ((Date.now() - start)).toFixed(1) + 'ms');
                return [2 /*return*/];
        }
    });
}); };
run();
//# sourceMappingURL=index.js.map