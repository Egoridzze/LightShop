var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');

/* GET home page. */
/*router.get('/', function(req, res, next) {
    res.render('index', { title: 'python is the beast' });
});*/

let mysql = require('mysql');
const app = require('../app');
let con = mysql.createConnection({ /*подключение к скрверу*/
    host: 'localhost',
    user: 'root',
    password: 'Parvus888Mir',
    database: 'market'
});

router.get('/', function(req, res) {
    let cat = new Promise(function(resolve, reject) {
        con.query(
            "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
            function(error, result, field) {
                if (error) return reject(error);
                resolve(result);
            }
        );
    }); /*промис который выводит на главную какую то фигову тучу пареметров 3х товаров с каждой категории */



    let catDescription = new Promise(function(resolve, reject) {
        con.query(
            "SELECT * FROM category",
            function(error, result, field) {
                if (error) return reject(error);
                resolve(result);
            }
        );
    }); /*выводит описания категорий*/
    Promise.all([cat, catDescription]).then(function(value) {
        console.log((value[1]));
        res.render('index', {
            goods: JSON.parse(JSON.stringify(value[0])),
            cat: JSON.parse(JSON.stringify(value[1])),
        }); /*ожидает ошибки указывает файл для рендаринга и рендарит каждую из категорий */
    });
});

router.get('/cat', function(req, res) {
    console.log(req.query.id);
    let catId = req.query.id;

    let cat = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM category WHERE id =' + catId,
            function(error, result) {
                if (error) reject(error);
                resolve(result);

            });
    });
    let goods = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM goods WHERE category=' + catId,
            function(error, result) {
                if (error) reject(error);
                resolve(result);
            });
    });
    Promise.all([cat, goods]).then(function(value) {
        console.log(value[0]);
        res.render('cat', {
            cat: JSON.parse(JSON.stringify(value[0])),
            goods: JSON.parse(JSON.stringify(value[1]))

        });
    })
});
router.get('/goods', function(req, res) {
    console.log(req.query.id);
    con.query('SELECT * FROM goods WHERE id=' + req.query.id, function(error, result) {
        if (error) throw error;
        res.render('goods', { goods: JSON.parse(JSON.stringify(result)) });
    });


});
router.get('/order', function(req, res) {
    res.render('order')
});
router.post('/get-category-list', function(req, res) {
    // console.log(req.body);
    con.query('SELECT id, category FROM category', function(error, result, fields) {
        if (error) throw error;
        console.log(result)
        res.json(result);
    });
});

router.post('/get-goods-info', function(req, res) {
    console.log(req.body.key);
    if (req.body.key.length != 0) {
        con.query('SELECT id,name,cost FROM goods WHERE id IN (' + req.body.key.join(',') + ')', function(error, result, fields) {
            if (error) throw error;
            console.log(result);
            let goods = {};
            for (let i = 0; i < result.length; i++) {
                goods[result[i]['id']] = result[i];
            }
            res.json(goods);
        });
    } else {
        res.send('0');
    }
});
router.post('/finish-order', function(req, res) {
    console.log(req.body);
    if (req.body.key.length != 0) {
        let key = Object.keys(req.body.key);
        con.query(
            'SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',') + ')',
            function(error, result, fields) {
                if (error) throw error;
                console.log(result);
                sendMail(req.body, result).catch(console.error);
                res.send('1');
            });
    } else {
        res.send('0');
    }
});

async function sendMail(data, result) {
    let res = '<h2>Order in lite shop</h2>'; //заголовок
    let total = 0; //общяя сумма денег
    for (let i = 0; i < result.length; i++) {
        res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost']*data.key[result[i]['id']]}</p>` //перебор фор лупом 1имя 2массив кол-во 3цена умноженная на массив кол-во
        total += result[i]['cost'] * data.key[result[i]['id']];
    }
    console.log(res);
    res += '<hr>';
    res += `Total ${total}`; //сумма заказа
    res += `<hr> Phone: ${data.phone}`; //тел клиента
    res += `<hr> Username: ${data.username}`; //имя клиента
    res += `<hr> Adress: ${data.adress}`; //адрес клиента
    res += `<hr> Email: ${data.email}`; //почта клиента

    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        }
    });

    let mailOption = {
        from: '<eelfimov91@gmail.com>',
        to: "eelfimov91@mail.ru," + data.email,
        subject: "Lite shop order",
        text: 'hello world',
        html: res
    };

    let info = await transporter.sendMail(mailOption); //отправка сообщений
    console.log("MessageSent: %s", info.messageId); //id сообщение
    console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info)); //место где можно глянуть это сообщение
    return true;
}




module.exports = router;