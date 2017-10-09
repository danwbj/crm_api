import * as _ from 'lodash'
import * as async from 'async'
declare var models: any;

let fixdata = ((obj, cb) => {
    models.user.findOne({ where: { openid: obj.openid } }).then(user => {
        if (user) {
            obj.channel = _.uniq(_.concat(user.channel, obj.channel))
        }
        cb(null, obj)
    })
})

let saveOrUpdateUser = ((obj, cb) => {
    models.user.upsert(obj).then(result => {
        models.user.findOne({ where: { openid: obj.openid } }).then(user => {
            cb(null, user)
        }).catch(err => {
            cb('findOne userinfo fail', null)
        })
    }).catch(err => {
        cb('upsert userinfo fail', null)
    })

})


// act_review_teacher
let fixdataRt = ((obj, cb) => {
    models.act_review_teacher.findOne({ where: { mobile: obj.mobile, act_id: obj.act_id } }).then(user => {
        let upUser = {}
        if (user) {
            upUser = _.merge({ id: user.id, name: user.name, mobile: user.mobile, password: user.password, ext: user.ext }, { ext: { openid: obj.openid } })
        }
        cb(null, upUser)
    })
})

let saveOrUpdateRt = ((obj, cb) => {
    models.act_review_teacher.upsert(obj).then(result => {
        console.log(result);
        models.act_review_teacher.findOne({ where: { id: obj.id } }).then(user => {
            cb(null, user)
        }).catch(err => {
            cb('findOne userinfo fail', null)
        })
    }).catch(err => {
        cb('upsert userinfo fail', null)
    })

})
// act_review_student
let fixdataRs = ((obj, cb) => {
    models.act_review_student.findOne({ where: { mobile: obj.mobile, act_id: obj.act_id } }).then(user => {
        let upUser = {}
        if (user) {
            upUser = _.merge({ id: user.id, name: user.name, mobile: user.mobile, password: user.password, ext: user.ext }, { ext: { openid: obj.openid } })
        }
        cb(null, upUser)
    })
})

let saveOrUpdateRs = ((obj, cb) => {
    models.act_review_student.upsert(obj).then(result => {
        console.log(result);
        models.act_review_student.findOne({ where: { id: obj.id } }).then(user => {
            cb(null, user)
        }).catch(err => {
            cb('findOne userinfo fail', null)
        })
    }).catch(err => {
        cb('upsert userinfo fail', null)
    })

})

let doCommand = (key, openid, cb) => {
    if (key != '') {
        let command = _.split(key, '-');
        if (command[0] == 'rt' && command.length == 3) {
            let obj: any = {}
            obj.mobile = command[2]
            obj.act_id = command[1]
            obj.openid = openid
            let getUser = ((cb) => {
                cb(null, obj)
            })
            async.waterfall([getUser, fixdataRt, saveOrUpdateRt], function (err, result) {
                if (err) {
                    cb('', null)
                }
                cb(null, `恭喜您${result.name},账户绑定成功！`)
            })
        }
        if (command[0] == 'rs' && command.length == 3) {
            let obj: any = {}
            obj.mobile = command[2]
            obj.act_id = command[1]
            obj.openid = openid
            let getUser = ((cb) => {
                cb(null, obj)
            })
            async.waterfall([getUser, fixdataRs, saveOrUpdateRs], function (err, result) {
                if (err) {
                    cb('', null)
                }
                cb(null, `恭喜您${result.name},账户绑定成功！`)
            })
        }
    }
}

export {
    fixdata, saveOrUpdateUser, doCommand
}