const express = require("express");
const router = express.Router();

const BookingModel = require("../models/booking");
const GuestModel = require("../models/guest");


router.get("/", (req, res) => {
  res.render("index");
});

router.get("/guest", async (req, res) => {
  const guest = await GuestModel.find();

  res.send(guest);
});

router.get("/table", async (req, res) => {
  const booking = await BookingModel.find();

  res.send(booking);
});

router.post("/table", async (req, res) => {
  const latest = await BookingModel.findOne().sort({
    id: -1,
  });

  let tables = Math.ceil(req.body.tables.count/6) || 1;

  new BookingModel({
    count: req.body.tables.count,
    date: req.body.tables.date,
    time: req.body.tables.time,
    table: tables,
    guestId: req.body.guestId,
    id: latest ? latest.id + 1 : 1000,
  }).save();

  res.send({
    success: true,
  });
});

router.post("/guest", async (req, res) => {
  let guestId;
  const registered = await GuestModel.findOne({
    email: req.body.email,
  });
  console.log(registered);
  if (!registered) {
    const latest = await GuestModel.findOne().sort({
      id: -1,
    });
    
    if (latest) guestId = latest.id + 1;
    else guestId = 1000;

    new GuestModel({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenr: req.body.phonenr,
      id: guestId,
    }).save();
    
  } else {
    guestId = registered.id;
  }

  res.send({
    guestId,
  });
});

router.post("/deleteall", async (req, res) => {
  await BookingModel.deleteMany({});
  await GuestModel.deleteMany({});
});

let othersuccess

router.post("/availability", async (req, res) => {
  BookingModel.find({
    date: req.body.date,
    time: req.body.time,
  }).then((bookingsFound) => {
    let tableCapacity = 0;
    // let extra = 0;
    bookingsFound.forEach((booking) => {
      tableCapacity += booking.table;
    });

    if (tableCapacity + Math.ceil(req.body.count/6) > 15) {
  
      BookingModel.find({
        date: req.body.date,
        time: req.body.time == 21 ? 18 : 21,
      }).then((othertime) => {
        let tables = 0;   
        othertime.forEach((booking) => {
             tables += booking.table;
        });

        if (tables >= 15) {
          othersuccess = false;
        } else {
          othersuccess = true;
        }
      });

      res.send({
        success: false,
        othersuccess
      });
    } else {
      res.send({
        success: true,
        othersuccess,
      });
    }
  });
});

module.exports = router;
