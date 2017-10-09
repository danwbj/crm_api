'use strict';


const uuid = require('uuid');
const fs = require('fs');
var mkdirp = require('mkdirp');
import config from '../../../config/config'
import * as Jimp from 'jimp'
import * as _ from 'lodash'


let mkdir = function (path) {
    return new Promise((resolve, reject) => {
        mkdirp(path, function (err) {
            if (err) {
                reject(new Error('创建文件夹失败.'))
            }
            resolve(true)
        });
    })
}

const uploader = function (file, options) {
    // Check if a file is selected for upload.
    if (!file) {
        throw new Error('No file to upload');
    }
    return _fileHandler(file, options);
};


const _fileHandler = async function (file, options) {
    const originalname = _.toLower(file.hapi.filename);
    const filename = `${uuid.v1()}.${_extension(originalname)}`;
    // Check if just images can be uploaded, otherwise write file.
    if (fileFilter(originalname)) {
        throw new Error('不支持的文件类型.');
    } else {
        //创建对应文件夹
        let _fileType = fileType(originalname)
        let d = new Date();
        let datastr = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        await mkdir(`${options.dest}${_fileType}/${datastr}`)

        const path = `${options.dest}${_fileType}/${datastr}/${filename}`;
        const rpath = `${_fileType}/${datastr}/${filename}`;
        // Write file on disk
        const filestream = fs.createWriteStream(path);
        // Return file data
        return new Promise((resolve, reject) => {
            file.on('error', function (err) {
                reject(err);
            });
            file.pipe(filestream);
            file.on('end', function (err) {
                if (err) reject(err);
                if (_fileType == 'pic') {
                    if (options.w) {
                        Jimp.read(path, function (err, image) {
                            if (err) reject(err);
                            image.cover(options.w, options.h).write(path);
                            resolve({ path: rpath, name: filename });
                        });
                    } else {
                        resolve({ path: rpath, name: filename });
                    }
                } else {
                    resolve({ path: rpath, name: filename });
                }
            });
        })
    }
};

// check file type.
const fileFilter = function (fileName) {
    if (fileName.match(/\.(jpg|png|apk|zip|mp3|mp4|doc|docx|xls|xlsx|pdf|txt|md)$/)) {
        return false;
    }
    return true;
};
//根据文件后缀区分文件类型（pic,video,audio,app';）
const fileType = function (fileName) {
    if (fileName.match(/\.(jpg|jpeg|png|gif|)$/)) {
        return 'pic';
    }
    if (fileName.match(/\.(mp3)$/)) {
        return 'audio';
    }
    if (fileName.match(/\.(mp4)$/)) {
        return 'video';
    }
    if (fileName.match(/\.(apk|zip)$/)) {
        return 'app';
    }
    if (fileName.match(/\.(doc|docx|xls|xlsx|pdf|txt|md)$/)) {
        return 'doc';
    }
    return false;
};

// Get file extension.
const _extension = function (fileName) {
    const arr = fileName.split('.');
    const item = arr.length - 1;
    return arr[item];
}

module.exports = uploader;
