const express = require("express");
const router = express.Router();
//引入用户列表
const UserController = require("../controller/UserController")
router.get("/userlist", UserController.UserList) //用户列表
router.post("/userregister", UserController.UserRegister); //注册
router.post("/userlogin", UserController.UserLogin); //登录验证
router.post("/obtainyzm", UserController.obtainyzm); //获取手机验证码
router.post("/checkingyzm", UserController.checkingyzm); //验证手机验证码
router.get("/randomcaptcha", UserController.obtainsjyzm); //获取随机验证码
module.exports = router;