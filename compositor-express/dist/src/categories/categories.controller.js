"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_data_1 = require("./categories.data");
let CategoriesController = class CategoriesController {
    themes() { return { items: categories_data_1.THEMES }; }
    emotions() { return { items: categories_data_1.EMOTIONS }; }
    styles() { return { items: categories_data_1.STYLES }; }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)('themes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get predefined themes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "themes", null);
__decorate([
    (0, common_1.Get)('emotions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get predefined emotions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "emotions", null);
__decorate([
    (0, common_1.Get)('styles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get predefined styles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "styles", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, common_1.Controller)('api/categories')
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map