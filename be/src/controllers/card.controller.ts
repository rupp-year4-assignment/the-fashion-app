import { IUser } from "@models/user";
import { CardService } from "@services/card.service";
import { Request, Response } from "express";

class CardController {
  constructor(private readonly cardService: CardService) {
    this.getCards = this.getCards.bind(this);
    this.createCard = this.createCard.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
  }

  async getCards(req: Request, res: Response) {
    const user = req.user as IUser;
    const cards = await this.cardService.getCardsByUser(user._id as any);

    res.status(200).json({
      success: true,
      message: "Cards fetched successfully",
      data: cards,
    });
  }

  async createCard(req: Request, res: Response) {
    const user = req.user as IUser;
    const card = await this.cardService.createCard(user._id as any, req.body);

    res.status(201).json({
      success: true,
      message: "Card saved successfully",
      data: card,
    });
  }

  async deleteCard(req: Request, res: Response) {
    const user = req.user as IUser;
    const cardId = req.params.cardId as string;

    await this.cardService.removeCard(user._id as any, cardId);

    res.status(200).json({
      success: true,
      message: "Card removed successfully",
    });
  }
}

export default CardController;
