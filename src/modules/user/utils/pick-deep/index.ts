import * as _ from 'lodash'

function getPath(obj, label) {
    let parents = []
    parents.push(label)
    function getPathName(obj) {
        parents.push(obj.label)
        if (obj.parent) {
            getPathName(obj.parent)
        }
    }
    getPathName(obj)
    return parents.reverse()
}

function getValue(obj, value) {
    let parents = []
    parents.push(value)
    function getPathName(obj) {
        parents.push(obj.value)
        if (obj.parent) {
            getPathName(obj.parent)
        }
    }
    getPathName(obj)
    return parents.reverse()
}

function pickDeep(value, items, level = 0, parent = null) {
    var i = 0, found;

    for (; i < items.length; i++) {
        if (items[i].value === value) {
            items[i].level = level
            if (parent) {
                items[i].parent = _.merge(parent, {})
                delete items[i].parent.children
            }
            items[i].path_name = items[i].parent ? getPath(items[i].parent, items[i].label) : [items[i].label]
            items[i].path_value = items[i].parent ? getValue(items[i].parent, items[i].value) : [items[i].value]
            return items[i];
        } else if (_.isArray(items[i].children)) {
            if (parent) {
                items[i].parent = _.merge(parent, {})
                delete items[i].parent.children
            }
            found = pickDeep(value, items[i].children, level++, items[i]);
            if (found) {
                return found;
            }
        }
    }
    return null
}

export default pickDeep 