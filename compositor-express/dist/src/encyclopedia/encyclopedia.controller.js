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
exports.EncyclopediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const encyclopedia_data_1 = require("./encyclopedia.data");
let EncyclopediaController = class EncyclopediaController {
    examples() { return { items: encyclopedia_data_1.EXAMPLES }; }
    vocabulary() { return { items: encyclopedia_data_1.VOCABULARY }; }
    tips() { return { items: encyclopedia_data_1.TIPS }; }
    structure() { return encyclopedia_data_1.STRUCTURE; }
};
exports.EncyclopediaController = EncyclopediaController;
__decorate([
    (0, common_1.Get)('examples'),
    (0, swagger_1.ApiOperation)({ summary: 'Classic flamenquito lyric examples' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EncyclopediaController.prototype, "examples", null);
__decorate([
    (0, common_1.Get)('vocabulary'),
    (0, swagger_1.ApiOperation)({ summary: 'Typical flamenco vocabulary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EncyclopediaController.prototype, "vocabulary", null);
__decorate([
    (0, common_1.Get)('tips'),
    (0, swagger_1.ApiOperation)({ summary: 'Writing tips for flamenquito fusion' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EncyclopediaController.prototype, "tips", null);
__decorate([
    (0, common_1.Get)('structure'),
    (0, swagger_1.ApiOperation)({ summary: 'Typical song structure' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EncyclopediaController.prototype, "structure", null);
exports.EncyclopediaController = EncyclopediaController = __decorate([
    (0, swagger_1.ApiTags)('encyclopedia'),
    (0, common_1.Controller)('api/encyclopedia')
], EncyclopediaController);
//# sourceMappingURL=encyclopedia.controller.js.map