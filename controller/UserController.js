const { connection, resquestQuery } = require("../database/db");
let moment = require("moment");
let bcrypt = require("bcryptjs");
let JWT = require("../token");
const random = require("string-random");
const svgCaptcha = require("svg-captcha");
//连接数据库

// 用户列表
exports.UserList = async (req, res) => {
  const data = await resquestQuery("select * from hg_users");
  res.json({
    data,
  });
};

// 用户注册
exports.UserRegister = async (req, res) => {
  const username = await resquestQuery(
    `select * from user where user_name="${req.body.username}"`
  );
  if (username != "") {
    res.json({
      msg: "用户名已存在",
    });
  } else {
    const phones = await resquestQuery(
      `select * from user where phones="${req.body.phones}"`
    );
    if (phones != "") {
      res.json({
        msg: "手机号注册重复",
      });
    } else {
      // 生成对应性别编号
      function sexpp() {
        switch (req.body.sex) {
          case "男":
            return 1;
          case "女":
            return 2;
          case "保密":
            return 0;
        }
      }
      // 自动生成日期
      let time = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
      // 密码加密
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);
      // 生成查看状态
      let isshow = Math.floor(Math.random() * 1);
      // 总结
      let create = `insert into user set user_name="${
        req.body.username
      }",user_password="${hash}",phones="${req.body.phones}",age="${
        req.body.age
      }",sex="${sexpp()}",createtime="${time}",is_show="${isshow}"`;
      connection.query(create, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            msg: "注册成功",
            data,
          });
        }
      });
    }
  }
};

// 用户登陆
exports.UserLogin = async (req, res) => {
  let data;
  //判断使用什么方式登陆
  if (req.body.phones) {
    data = await resquestQuery(
      `select * from hg_users where phones="${req.body.phones}"`
    );
  } else {
    data = await resquestQuery(
      `select * from hg_users where user_name="${req.body.username}"`
    );
  }
  // 判断是否可以查询的到用户数据
  if (!data.length) {
    return res.json({
      msg: "用户不存在!",
    });
  } else {
    console.log(req.body + " 123");
    console.log(captcha + " 123");
    console.log(randomcaptcha + " 123");
    if (req.body.captcha.toLowerCase() != randomcaptcha.toLowerCase()) {
      console.log(req.body.captcha.toLowerCase() + "12333");
      console.log(randomcaptcha.toLowerCase() + "12333");
      return res.json({
        msg: "验证码不正确",
        status: 40004,
      });
    }
    console.log(data);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(data[0].login_password, salt);
    // let hash = data[0].login_password;
    console.log(hash);
    let ifpassword = bcrypt.compareSync(req.body.password, hash);
    console.log("REQ BODY PASSWORD " + req.body.password);
    console.log("HASH " + hash);
    console.log("IFPASSWORD + " + ifpassword);
    if (ifpassword) {
      // 使用token生成token
      let token = JWT.createToken({
        login: true,
        user_name: data[0].user_name,
      });
      return res.json({
        msg: "登陆成功",
        status: 200,
        data,
        token,
      });
    } else {
      return res.json({
        msg: "密码错误",
      });
    }
  }
};

// 获取拟真手机验证码
let phone = null;
let captcha = null;
let randomcaptcha = null;
exports.obtainyzm = async (req, res) => {
  phone = req.body.phones;
  captcha = Math.floor(Math.random() * 10000 - 1000) + 1000;
  console.log(captcha);
  res.json({
    msg: "验证码获取成功",
    phone,
    captcha: captcha,
    status: 200,
  });
};
// 获取随机验证码
exports.obtainsjyzm = async (req, res) => {
  //http://localhost:3000/admin/randomcaptcha
  let captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: "0o1i",
    noise: 0,
    color: true,
    background: "#666",
  });
  // req.session.captcha = captcha.text;
  console.log("123");
  randomcaptcha = captcha.text;
  console.log(randomcaptcha);
  res.type("svg");
  res.status(200).send(captcha.data);
};
// 验证验证码
exports.checkingyzm = async (req, res) => {
  if (req.body.captcha.toLowerCase() != randomcaptcha.toLowerCase()) {
    return res.json({
      msg: "验证码不正确",
      status: 40004,
    });
  }
  if (req.body.phones == phone) {
    console.log(req.body);
    if (req.body.checkingcode == captcha) {
      const data = await resquestQuery(
        `select * from user where phones="${req.body.phones}"`
      );
      // 判断登录用户是否注册
      if (data.length != 0) {
        // 生成token令牌
        let token = JWT.createToken({
          login: true,
          phone: phone,
        });
        return res.json({
          msg: "登录成功",
          data,
          status: 200,
          token,
        });
      } else {
        // 随机生成username
        let user_name = "yz_" + random(16);
        //生成创建时间
        let time = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
        // 生成密码
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(123456, salt);
        // 提交创建
        await connection.query(
          `insert into user (user_name,phones,user_password,createtime) values("${user_name}","${req.body.phones}",${hash},"${time}")`
        );
        // 验证是否创建
        const phoneslogin = await resquestQuery(
          `select * from user where phones="${req.body.phones}"`
        );
        // 生成token令牌
        let token = JWT.createToken({
          login: true,
          phone: phone,
        });
        return res.json({
          msg: "登录成功",
          phoneslogin,
          status: 200,
          token,
        });
      }
    } else {
      return res.json({
        msg: "验证码输入错误",
        status: 4002,
      });
    }
  } else {
    return res.json({
      msg: "你好像换了号码",
      status: "4001",
    });
  }
};
