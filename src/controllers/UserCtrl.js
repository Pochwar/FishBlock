const encrypt = require( 'bcrypt');
const winston = require( 'winston');
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const UserModel = require( './../models/UserModel');
const mongoose = require('mongoose');

class UserCtrl {
    constructor(conf){
        this._conf = conf;
    }
    getWall(req, res) {
        res.render('wall.twig');
    }

    getUserInfo(req, res) {
        let i18nMsg = ""
        if (!_.isEmpty(req.query.msg)) {
            const msg = req.query.msg;
            winston.info(msg)
            if (this._conf.site.authErrMsg.userMod.includes(msg)) {
                winston.info("test")
                i18nMsg = res.__(msg)
            }
        }
        res.render('user.twig', {
            msg: i18nMsg,
        });
    }

    putUserInfo(req, res) {
        const userId = req.body.userId;
        const dataToChange = req.body.change;

        const user = new UserModel();

        //delete avatar function
        const deleteAvatar = (fileName) => {
            //update user info in db
            return new Promise((resolve, reject) => {
                user.updateData(userId, "avatar", "")
                    .then( () => {
                        //delete file
                        return fs.unlink(path.join(this._conf.site.default.avatarPath, fileName));
                    })
                    .then( () => {
                        resolve();
                    })
                    .catch( (err) => {
                        winston.info(err);
                        reject();
                    })
                ;
            })
        }

        //no change
        if(!dataToChange){
            res.redirect('/user?msg=UIM_noChange');
        }

        //User Information Verification
        const UIV = req.app.get('UIV');

        //change password
        if(dataToChange === "password"){
            //check passwords are same
            if (req.body.password !== req.body.passwordConf) {
                res.redirect('/user?msg=UIM_passNoMatch');
            }

            //check password is alphanumeric
            let checkPassAlphaNum = UIV.checkAlphaNumOnly(req.body.password);
            if (!checkPassAlphaNum) {
                res.redirect('/user?msg=UIM_passAlphaNumError');
            }

            const saltRounds = 10;
            encrypt.hash(req.body.password, saltRounds, (err, hash) => {
                if(err) {
                    res.redirect('/user?msg=UIM_passError');
                } else {
                    winston.info(userId)
                    user.updateData(userId, dataToChange, hash)
                        .then(document => {
                            res.redirect('/user?msg=UIM_passChangeOk');
                        })
                        .catch(err =>{
                            res.redirect('/user?msg=UIM_dbError');
                        })
                    ;
                }
            })
        }

        //change avatar
        else if(dataToChange === "avatar"){

            //TODO : get error from Multer

            //if user has already an avatar
            if (req.body.fileName != ""){
                //delete previous avatar
                deleteAvatar(req.body.fileName)
                    .then( () => {
                        //set new avatar
                        user.updateData(userId, dataToChange, req.file.filename)
                            .then( () => {
                                res.redirect('/user?msg=UIM_avatarChangeOk');
                            })
                            .catch( () => {
                                res.redirect('/user?msg=UIM_dbError');
                            })
                        ;
                    })
                    .catch( () => {
                        res.redirect('/user?msg=UIM_avatarDeletetionError');
                    })
                ;
            } else {
                //set new avatar
                user.updateData(userId, dataToChange, req.file.filename)
                    .then( () => {
                        res.redirect('/user?msg=UIM_avatarChangeOk');
                    })
                    .catch( () => {
                        res.redirect('/user?msg=UIM_dbError');
                    })
                ;
            }
        }

        //delete avatar
        else if(dataToChange === "deleteAvatar"){
            deleteAvatar(req.body.fileName)
                .then( () => {
                    res.redirect('/user?msg=UIM_avatarDeleted');
                })
                .catch( () => {
                    res.redirect('/user?msg=UIM_avatarDeletetionError');
                })
            ;
        }

        //change date
        else if(dataToChange === "birthday"){
            //check birthday
            let birthdayOk = UIV.checkDateFormat(req.body.birthday);
            if(!birthdayOk){
                res.redirect('/user?msg=UIM_birthdayError');
            }

            const birthdayArray = req.body.birthday.split("/");
            const birthday = new Date(birthdayArray[2],(birthdayArray[1]-1), birthdayArray[0]);
            
            user.updateData(userId, dataToChange, birthday)
                .then(document => {
                    winston.info("ok")
                    res.redirect('/user?msg=UIM_birthdayChangeOk');
                })
                .catch(err => {
                    winston.info(`error : ${err}`)
                    res.redirect('/user?msg=UIM_dbError');
                })
            ;
        }

        //change lang
        else if(dataToChange === "langId"){
            //check birthday
            let langIdOk = UIV.checkLangId(req.body.langId);
            if(!langIdOk){
                res.redirect('/user?msg=UIM_langIdError');
            }

            user.updateData(userId, dataToChange, req.body.langId)
                .then(document => {
                    winston.info("ok")
                    res.redirect('/user?msg=UIM_langIdChangeOk');
                })
                .catch(err => {
                    winston.info(`error : ${err}`)
                    res.redirect('/user?msg=UIM_dbError');
                })
            ;
        }

        //change mail
        else if(dataToChange === "mail"){
            //check birthday
            let mailOk = UIV.checkMail(req.body.mail);
            if(!mailOk){
                res.redirect('/user?msg=UIM_mailError');
            }

            user.updateData(userId, dataToChange, req.body.mail)
                .then(document => {
                    winston.info("ok")
                    res.redirect('/user?msg=UIM_mailChangeOk');
                })
                .catch(err => {
                    winston.info(`error : ${err}`)
                    res.redirect('/user?msg=UIM_dbError');
                })
            ;
        }

        //change anything else
        else {
            //check password is alphanumeric
            let checkAlphaNum = UIV.checkAlphaNumOnly(req.body.value);
            if (!checkAlphaNum) {
                res.redirect('/user?msg=UIM_'+dataToChange+'AlphaNumError');
            }

            user.updateData(userId, dataToChange, req.body.value)
                .then( () => {
                    winston.info("ok")
                    res.redirect('/user?msg=UIM_'+dataToChange+'ChangeOk');
                })
                .catch( err => {
                    winston.info(`error : ${err}`)
                    res.redirect('/user?msg=UIM_dbError');
                })
            ;
        }
    }
}

module.exports = UserCtrl;
