import * as Boom from 'boom'
import * as superagent from 'superagent'


module.exports.getbyticket = {
    handler: function(request, reply) {
        let data = request.payload.data;
        let url = 'https://sim.dxy.cn/japi/open/qiye/contact/getbyticket?'+data;
        console.log("-------------------------------------------data=" + data);
        let req = superagent.get(url);
        req.timeout(10000)
        req.end((err, res) => {
            if (err || !res || !res.body || res.body.error) {

                //                     reply( {
                //     "message": "",
                //     "item": {
                //         "id": 8,
                //         "teamId": 132,
                //         "userId": "liyuanyuan",
                //         "name": "张三",
                //         "position": null,
                //         "mobile": "15158117130",
                //         "gender": "无",
                //         "telephone": null,
                //         "email": "8093016@qq.com",
                //         "wxid": "luoqibdt1",
                //         "hrcode": null,
                //         "status": 1,
                //         "createTime": 1414751121000
                //     },
                //     "success": true
                // }).header("Access-Control-Allow-Origin", "*")
                //     .header("Access-Control-Allow-Credentials", "true")
                //     .header("Access-Control-Allow-Headers", "X-Requested-With")
                //     .header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
                //     .header("X-Powered-By",' 3.2.1');//test
                console.log(JSON.stringify(err));
                reply(err).header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Allow-Headers", "X-Requested-With")
                    .header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
                    .header("X-Powered-By", ' 3.2.1');
            }
            else {
                console.log(JSON.stringify(res.body));
                return reply(res.body).header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Allow-Headers", "X-Requested-With")
                    .header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
                    .header("X-Powered-By", ' 3.2.1');
            }
        })

    }
};
