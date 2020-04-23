const pool = require('../pool');
const utility = require('./utility');
const fs = require('fs');
const sendEmail = require('../nodeMailer/sendEmail');

const addVictimData = async (req, res) => {
    // console.log(req.file);
    // console.log(req.body);
    //const uid = req.params.id;
    const { path, filename } = req.file;
    let imageMatched = await utility.matchImage(filename);
    console.log(imageMatched);
    let ccid = 0;
    if (!imageMatched[2].includes('Unknown')) {
        ccid = imageMatched[2][0].split('_')[0];
    } else {
        ccid = null;
    }

    const { age, pwdstat, activity, description, uid } = req.body;
    let location = await utility.getLocation(filename);
    console.log(location);
    let sex = await utility.findGender(filename);
    console.log(sex);
    // console.log(path);
    const { date, time } = utility.getDateTime();
    pool.query(
        'INSERT INTO victim (sex, age, pwdstat, activity, description, date, time, location, image, uid, ccid) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
            sex,
            age,
            pwdstat,
            activity,
            description,
            date,
            time,
            location,
            path,
            uid,
            ccid,
        ],
        (error, result) => {
            if (error) {
                console.log('error occured');
                res.redirect('/victimform');
                throw error;
            }
            sendEmail(req.body.uid, 'Thank you for using the NoAbuse app!');
            res.writeContinue(200, { success: true });
        }
    );

    // let imageMatched = await utility.matchImage(filename);
    // console.log(imageMatched);

    // if(!imageMatched[2].includes('Unknown')){
    //     let ccid= imageMatched[2][0];
    //     pool.query('UPDATE victim SET ccid= $1 where victm')
    // }

    res.redirect('/');

    // pool.query("SELECT * FROM victim", (error, result) => {
    //     res.status(200).json(result.rows);
    // });
};

const createUser = (req, res) => {
    const { name, email, password, contact } = req.body;
    pool.query(
        'INSERT INTO users (name,email,password,contact) VALUES($1,$2,$3,$4)',
        [name, email, password, contact],
        (error, result) => {
            if (error) {
                throw error;
            }

            res.writeContinue(200, { success: true });
        }
    );
    pool.query('SELECT * FROM users', (error, result) => {
        if (error) throw error;
        res.status(200).send(result.rows);
    });
};

const getUser = (req, res) => {
    const { email, password } = req.body;
    pool.query(
        'SELECT * FROM users WHERE "password" = $2 and "email" = $1',
        [email, password],
        (error, result) => {
            if (error) throw error;
            res.writeContinue(200, { success: true });
        }
    );
};

module.exports = { addVictimData, getUser, createUser };
