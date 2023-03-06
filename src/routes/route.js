const express = require("express");
const { register, login, changePassword } = require("../control/register");
const {
  updateProfile,
  addEmployees,
  updateEmployee,
  deleteEmployee,
  blockStartup,
  upgradeSubscription,
  createSupportForm,
  unblockStartup,
  getStartupProfile,
  getStartupListAdmin,
} = require("../control/startUp");
const investor = require("../control/investor");
const router = express.Router();
const multer = require("multer");
const {
  getAdminProfile,
  updateProfileAdmin,
  createBlog,
  editBlog,
  getBlogsById,
  getBlogs,
  createTestimonials,
  editTestimonials,
  deleteBlog,
  deleteTestimonials,
  getAlltestimonials,
  getTestimonialsById,
  supportTicket,
  getTicketById,
  getUserCount,
  getAdminList,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getDashboardData,
  pricingPlan,
  getPricing,
  updatePricing,
  loginImageUpload,
  loginImageUpdate,
  getImageLink,
  deleteCustomers,
  createStartupPlan,
  getStartupPlans,
  updateStartupPlan,
  createInvestorPlan,
  getInvestorPlans,
  updateInvestorPlan,
  updateTicketStatus,
} = require("../control/admin");
const ResetPassword = require("../control/resetpassword");
const { createMessage, getMessage, recentChats } = require("../control/chat");
const { forgotPassword } = require("../control/forgotPassword");
const requestList = require("../control/requestList");
const {
  orderCreate,
  webHookTrigger,
  downgradeSubscription,
} = require("../payments/payment");
router.use(multer().any());

//downgrade subscription
router.put("/downgrade/:email", downgradeSubscription);

//forgot password
router.post("/forgot-password", ResetPassword.forgotPass);

//reset password
router.put("/reset-password", ResetPassword.resetPass);

// Payment API

router.post("/create/orderId", orderCreate);

router.post("/webHookTrigger", webHookTrigger);

/**
 * forgot password
 */
router.put("/forgotPassword", forgotPassword);

/**
 * requestList API's
 */
//send request...
router.post("/sendRequest/:id1/:id2", requestList.sendRequest);

// get Request List
router.get("/requestList/:Id", requestList.getRequestList);

//accept or reject request..
router.put("/requestStatus/:Id/:Id2", requestList.acceptOrRejectRequest);

//delete a connection
router.put("/removeConnection/:id1/:id2", requestList.removeConnection);

/**
 * Notification API..
 */
router.get("/getNotification/:Id", requestList.getNotification);

//update notification..
router.put("/notificationUpdate/:Id/:notifId", requestList.updateNotification);

/**
 * Chat API"s
 */
router.post("/chat", createMessage);

//get Messages;
router.get("/getChats/:from/:to", getMessage);

//get recent chat list of a particular user
router.get("/recentChats/:id", recentChats);

/**
 * Change Password
 */
router.put("/changePassword/:Id", changePassword); //--> provide query(?) to identify the user

/**
 * ADMIN SIDE API's
 */
// get admin profile
router.get("/getProfileAdmin", getAdminProfile);

//update Admin Profile..
router.put("/updateProfileAdmin", updateProfileAdmin);

//get all startup's for admin..]

router.get("/getStartup", getStartupListAdmin);

//block startup for admin
router.delete("/blockStartup/:Id", blockStartup);

//unblock Startup
router.put("/unblockStartup/:Id", unblockStartup);

// create Blogs .
router.post("/createBlog", createBlog);

//edit Blogs
router.put("/updateBlogs/:Id", editBlog);

// get particular blog ..
router.get("/getInBlog/:Id", getBlogsById);

// delete Blogs...
router.delete("/deleteBlogs/:Id", deleteBlog);

// trending Stories..
router.get("/trendingStories", getBlogs);

//create testimonials
router.post("/createTestimonial", createTestimonials);

//edit testimonials
router.put("/editTestimonials/:Id", editTestimonials);

//delete testimonials..
router.delete("/deleteTestimonials/:Id", deleteTestimonials);

//get All Testimonials..
router.get("/getAllTestimonials", getAlltestimonials);

//get Particular testimmonial By Id
router.get("/getTestimonialById/:Id", getTestimonialsById);

//get Support Tickets ..
router.get("/getAllTickets", supportTicket);

//get particular ticket by id;
router.get("/getTicket/:Id", getTicketById);

//update support ticket status
router.put("/updateSupportTicket/:Id", updateTicketStatus);

//dashboard stats
router.get("/totalUsers", getUserCount);

//admin list ---> User Management API
router.get("/adminList", getAdminList);

//create User..
router.post("/createUser", createUser);

//update user..
router.put("/updateUser/:Id", updateUser);

//delete User..
router.delete("/deleteUser/:Id", deleteUser);

// get particular user by id
router.get("/getUserById/:Id", getUserById);

// get dashboard Count data;
router.get("/dashboard", getDashboardData);

//pricing Plan create..
router.post("/pricingPlan", pricingPlan);

//get pricing Plan..
router.get("/getPricing", getPricing);

//upddate Pricing plan...
router.put("/updatePricing", updatePricing);

//login Image Upload...
router.post("/loginImage", loginImageUpload);

// login image update..
router.put("/updateLoginImage", loginImageUpdate);

//get Image Link
router.get("/getImageLink", getImageLink);

//delete stratups or investors..

router.delete("/deleteCustomers/:Id", deleteCustomers);

//create a startup-pricing plan
router.post("/admin/startupplan", createStartupPlan);

//get startups plans
router.get("/startupplan", getStartupPlans);

//update startup plan
router.put("/admin/startupplan/:id", updateStartupPlan);

//create a investor plan
router.post("/admin/investorplan", createInvestorPlan);

//get investor plan
router.get("/investorplan", getInvestorPlans);

//update startup plan
router.put("/admin/investorplan/:id", updateInvestorPlan);

/**
 * STARTUP API's
 */

//Login API
router.post("/login", login);

//Register and Login API
router.post("/register", register);

//get StartUp Profile Details
router.get("/getStartupProfile", getStartupProfile);

// Update Startup
router.put("/editStartupProfile/:Id", updateProfile);

// add Employees for startup
router.post("/addEmployee", addEmployees);

// update Employees for Startup
router.put("/updateEmployee", updateEmployee);

// Delete Employees for startup
router.delete("/deleteEmployee", deleteEmployee);

// upgrade Subscription for startup
router.put("/upgradeSubscription/:Id", upgradeSubscription);

// add support form
router.post("/addSupportForm", createSupportForm);

//Investor APIs (Admin)

//investor details
router.get("/investor/details/:investorId", investor.investorDetails);

//update investor
router.put("/investor/update/:investorId", investor.updateInvestor);

//delete investor
router.delete("/investor/delete/:id", investor.deleteInvestor);

//list of investors
router.get("/investor/list", investor.getInvestorList);

//block user
router.delete("/investor/block/:id", investor.blockInvestor);

//unblock user
router.delete("/investor/unblock/:id", investor.unblockInvestor);

//search investor
router.get("/investor/search", investor.searchInvestor);

//Inestor APIS (Customer)
//search startups
router.get("/investor/searchStartup", investor.searchStartup);

//invesor profile
router.get("/investor/profile/:investorId", investor.getInvestorProfile);

//homePage ---> top rising startup
router.get("/topStartups", investor.getTopStartups);

//add startup to connections
router.put("/investor/addConnection/:Id", investor.addConnection);

//search --> name and location
router.get("/search", investor.search);

module.exports = router;
