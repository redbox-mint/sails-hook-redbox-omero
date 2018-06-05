"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var services = require("../core/CoreService");
var Services;
(function (Services) {
    var OMEROService = (function (_super) {
        __extends(OMEROService, _super);
        function OMEROService() {
            var _this_1 = _super !== null && _super.apply(this, arguments) || this;
            _this_1._exportedMethods = [];
            return _this_1;
        }
        return OMEROService;
    }(services.Services.Core.Service));
    Services.OMEROService = OMEROService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.OMEROService().exports();
