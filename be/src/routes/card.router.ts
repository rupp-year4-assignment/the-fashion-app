import CardController from "@controllers/card.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import CardServiceImpl from "@services/impl/card.service.impl";
import asyncHandler from "@utils/asyncHandler";
import { Router } from "express";

const cardRouter = Router();
const cardController = new CardController(new CardServiceImpl());

cardRouter.get("/cards", asyncHandler(cardController.getCards));
cardRouter.post(
  "/cards",
  validationMiddleware.addPaymentCard,
  ValidationMiddleware,
  asyncHandler(cardController.createCard)
);
cardRouter.delete(
  "/cards/:cardId",
  validationMiddleware.removePaymentCard,
  ValidationMiddleware,
  asyncHandler(cardController.deleteCard)
);

export default cardRouter;
