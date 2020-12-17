const express = require("express");
//引入自定义的模块
const admin = require("./route/admin");

const app = new express();

// 后台允许前端跨域请求数据开始
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With,yourHeaderFeild");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    if (req.method == "OPTIONS") {
        res.send(200)
    } else {
        next();
    }
})

//配置post发送的数据
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

app.use("/admin", admin)

app.listen(3000, () => {
    console.log("启动成功")
})