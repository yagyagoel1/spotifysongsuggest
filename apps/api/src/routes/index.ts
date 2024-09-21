import { Router } from "express";
import { assumedGenre, getSongs } from "../controller/index.controller";

 const router:Router= Router()
router.route("/songs").get(getSongs)
router.route("/guessfavartist").post(assumedGenre)
export default router