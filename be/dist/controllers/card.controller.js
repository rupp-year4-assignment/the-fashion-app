"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CardController {
    constructor(cardService) {
        this.cardService = cardService;
        this.getCards = this.getCards.bind(this);
        this.createCard = this.createCard.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
    }
    getCards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const cards = yield this.cardService.getCardsByUser(user._id);
            res.status(200).json({
                success: true,
                message: "Cards fetched successfully",
                data: cards,
            });
        });
    }
    createCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const card = yield this.cardService.createCard(user._id, req.body);
            res.status(201).json({
                success: true,
                message: "Card saved successfully",
                data: card,
            });
        });
    }
    deleteCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const cardId = req.params.cardId;
            yield this.cardService.removeCard(user._id, cardId);
            res.status(200).json({
                success: true,
                message: "Card removed successfully",
            });
        });
    }
}
exports.default = CardController;
