import * as favouriteService from "../services/favouriteService.js";

export async function getMyFavourites(req, res, next) {
  try {
    const bookIds = await favouriteService.listMyFavourites(req.user.id);
    res.json({ bookIds });
  } catch (error) {
    next(error);
  }
}

export async function addFavourite(req, res, next) {
  try {
    const result = await favouriteService.addFavourite(req.user.id, req.params.bookId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeFavourite(req, res, next) {
  try {
    await favouriteService.removeFavourite(req.user.id, req.params.bookId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
