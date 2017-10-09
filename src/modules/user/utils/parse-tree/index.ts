import * as _ from 'lodash'

let parseTree = function (data) {

    let root = function (data) {
        let r = {
            children: []
        };
        _.forEach(data, function (e) {
            if (null === e.org_id) {
                if (e.org_perms) {
                    r['value'] = e.id;
                    r['label'] = e.name;
                    r['org_perms'] = e.org_perms;
                    r['owner'] = true;
                } else {
                    r['value'] = e.id;
                    r['label'] = e.name;
                    r['owner'] = false;
                }
            }
        });
        return r;
    };

    let make = function (data) {
        let r = root(data);
        _.forEach(data, function (e) {
            walk(r, e, func);
        });
        return r;
    };

    let walk = function (r, e, f) {
        if (e.org_id === r.key || e.org_id == r.value) {
            f(r, e);
            return;
        }
        _.forEach(r.children, function (t) {
            walk(t, e, f);
        });
    };

    let func = function (r, e) {
        if (e.org_id != null) {
            let j = {
                children: []
            };
            if (e.org_perms) {
                j['value'] = e.id;
                j['label'] = e.name;
                j['org_perms'] = e.org_perms;
                j['owner'] = e.owner;
            } else {
                j['value'] = e.id;
                j['label'] = e.name;
                j['owner'] = e.owner;
            }
            r.children.push(j);
        }
    }
    return [make(data)];
};


export default parseTree 