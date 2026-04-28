const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware, roleCheck } = require("../middleware/auth");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");
const invitedUserController = require("../controllers/invitedUserController");
const checkinController = require("../controllers/checkinController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authMiddleware, authController.me);
router.put("/auth/change-password", authMiddleware, authController.changePassword);

router.get("/users", authMiddleware, roleCheck("admin_sistem"), userController.getAllUsers);
router.post("/users", authMiddleware, roleCheck("admin_sistem"), userController.createUser);
router.put("/users/:id", authMiddleware, roleCheck("admin_sistem"), userController.updateUser);
router.delete("/users/:id", authMiddleware, roleCheck("admin_sistem"), userController.deleteUser);
router.put("/users/:id/reset-password", authMiddleware, roleCheck("admin_sistem"), userController.resetPassword);

router.get("/events", authMiddleware, roleCheck("admin_sistem"), eventController.getAllEvents);
router.get("/events/my", authMiddleware, roleCheck("admin_lapangan"), eventController.getMyEvents);
router.get("/events/:id", authMiddleware, eventController.getEventById);
router.post("/events", authMiddleware, roleCheck("admin_sistem"), eventController.createEvent);
router.put("/events/:id", authMiddleware, roleCheck("admin_sistem"), eventController.updateEvent);
router.delete("/events/:id", authMiddleware, roleCheck("admin_sistem"), eventController.deleteEvent);
router.put("/events/:id/assign-admins", authMiddleware, roleCheck("admin_sistem"), eventController.assignAdmins);

router.get("/events/:eventId/invited-users", authMiddleware, roleCheck("admin_sistem"), invitedUserController.getInvitedUsersByEvent);
router.get("/invited-users/:id", authMiddleware, roleCheck("admin_sistem"), invitedUserController.getInvitedUserById);
router.post("/events/:eventId/invited-users", authMiddleware, roleCheck("admin_sistem"), invitedUserController.createInvitedUser);
router.post("/events/:eventId/invited-users/bulk", authMiddleware, roleCheck("admin_sistem"), upload.single("file"), invitedUserController.bulkImportInvitedUsers);
router.put("/invited-users/:id", authMiddleware, roleCheck("admin_sistem"), invitedUserController.updateInvitedUser);
router.delete("/invited-users/:id", authMiddleware, roleCheck("admin_sistem"), invitedUserController.deleteInvitedUser);
router.get("/events/:eventId/qr-codes", authMiddleware, roleCheck("admin_sistem"), invitedUserController.generateQrCodes);

router.post("/checkin", authMiddleware, roleCheck("admin_lapangan"), checkinController.checkin);
router.post("/checkin/manual", authMiddleware, roleCheck("admin_lapangan"), checkinController.manualCheckin);
router.get("/events/:eventId/checkin-status", authMiddleware, checkinController.getCheckinStatus);
router.get("/events/:eventId/checkin-logs", authMiddleware, checkinController.getCheckinLogs);
router.get("/events/:eventId/report", authMiddleware, checkinController.getReport);

router.post("/undangan/login", invitedUserController.undanganLogin);

module.exports = router;
