import express from "express";
import catchAsycError from "../utils/helpers/catchAsycError";
import { getInitialData } from "../controllers/initialData/initialData";
import { validate } from "../middlewares/validator";
import { initialDataShema } from "../json-schemas/schemas/initialData";
import { idintify } from "../middlewares/authorization/idintify";

const router = express.Router();
router.use(idintify)
router.get(
  "/initialData",
  validate({ schema: initialDataShema, whatToValidate: "body" }),
  catchAsycError(getInitialData)
);

export default router
