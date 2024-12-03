import express from "express";
import { checkLogin, isAdmin } from "../middlewares/auth.js";
import TicketController from "../controllers/tickets.js";

const ticketRouter = express.Router();

ticketRouter.get("/", checkLogin, TicketController.getTickets);
ticketRouter.get("/revenue-stats", checkLogin, TicketController.getRevenue);
ticketRouter.get("/user-top", checkLogin, TicketController.getTopUsers);
ticketRouter.get("/me", checkLogin, TicketController.getMyTickets);
ticketRouter.post("/callbackPay", TicketController.callbackPay);
ticketRouter.post("/create", checkLogin, TicketController.createTicket);
ticketRouter.get("/:id", checkLogin, TicketController.getTicket);
ticketRouter.put(
  "/update-status/:id",
  checkLogin,
  TicketController.updateTicketStatus
);
ticketRouter.post(
  "/payment/:id",
  checkLogin,
  TicketController.updateTicketPaymentMethod
);
/* ticketRouter.post("/zalopaypayment", TicketController.createzalopaypaymentUrl); */
ticketRouter.post(
  "/order-status/:app_trans_id",
  TicketController.oderStatusPay
);

export default ticketRouter;
