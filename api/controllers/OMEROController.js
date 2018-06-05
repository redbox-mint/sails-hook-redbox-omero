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
var url = require('url');
var controller = require("../core/CoreController");
var Controllers;
(function (Controllers) {
    var OMEROController = (function (_super) {
        __extends(OMEROController, _super);
        function OMEROController() {
            var _this = _super.call(this) || this;
            _this._exportedMethods = [];
            _this._config = {};
            return _this;
        }
        return OMEROController;
    }(controller.Controllers.Core.Controller));
    Controllers.OMEROController = OMEROController;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.OMEROController().exports();
