const CONF = require('./../../config/config');
const mongoose = require( 'mongoose');
const encrypt = require( 'bcrypt');
const winston = require('winston');
const _ = require( 'underscore');
const UserModel = require( './../models/UserModel');

mongoose.Promise = global.Promise;

class RegistrationCtrl {
    get(req, res){
        let msg = "";
        if (!_.isEmpty(req.param("msg"))) {
            msg = req.param("msg");
        }
        res.render('registration.twig', {
            msg: msg,
        })
    }

    post(req, res){
        //check fields
        if (
            _.isEmpty(req.body.firstname) ||
            _.isEmpty(req.body.lastname) ||
            _.isEmpty(req.body.pseudo) ||
            _.isEmpty(req.body.bDay) ||
            _.isEmpty(req.body.mail) ||
            _.isEmpty(req.body.pass) ||
            _.isEmpty(req.body.passConf) ||
            _.isEmpty(req.body.lanId)
        ) {
            res.redirect('/register?msg=emptyError');
        }

        //check passwords
        if (req.body.pass !== req.body.passConf) {
            res.redirect('/register?msg=passError');
        }

        //check db connection
        if (mongoose.connection._readyState !== 1) {
            res.redirect('/register?msg=dbError');
        }

        //CREATE NEW USER
        const user = new UserModel();
        //get date of the day
        const now = new Date();
        const inscrDay = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        //set default ban status and role id
        const ban = CONF.site.default.ban;
        const roleId = CONF.site.default.role;
        //hash password
        const saltRounds = 10;
        encrypt.hash(req.body.pass, saltRounds, (err, hash) => {
            user.registerInDb(
                req.body.firstname,
                req.body.lastname,
                req.body.pseudo,
                req.body.bDay,
                req.body.mail,
                inscrDay,
                hash,
                req.body.avatar,
                ban,
                req.body.lanId,
                roleId
            )
                .then(object => {
                    winston.info(`### user ${req.body.pseudo} created ! ###`);
                    winston.info(object);
                    res.redirect('/register?msg=ok');
                })
                .catch(err => {
                    winston.info(`error :  ${err.message}`);
                    res.redirect('/register?msg=duplicate');
                })
            ;
        })

    }

}

module.exports = RegistrationCtrl;